import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule, NgTemplateOutlet } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RestaurantConfigService } from '../../../services/admin/restaurant-config';
import {
  RestaurantConfig,
  UpdateRestaurantDetailsRequest
} from '../../../models/restaurant-config.model';
import { NotificationServices } from '../../../services/notification-services';

interface DetailsForm {
  restaurantName: string;
  description: string;
  address: string;
  phoneNumber: string;
  email: string;
  openingTime: string;
  closingTime: string;
  about: string;
}

// ─── KB node tree ─────────────────────────────────────────────────────────────

export type KbNodeType = 'string' | 'number' | 'boolean' | 'object' | 'array' | 'null';

export interface KbNode {
  id: number;
  key: string;           // field name (empty string for array items)
  type: KbNodeType;
  strValue: string;      // used for string / number / boolean / null
  children: KbNode[];    // used for object / array
  collapsed: boolean;
}

let _nodeId = 1;

function newNode(key = '', type: KbNodeType = 'string'): KbNode {
  return { id: _nodeId++, key, type, strValue: '', children: [], collapsed: false };
}

function jsonToNode(key: string, value: unknown): KbNode {
  if (value === null) {
    return { id: _nodeId++, key, type: 'null', strValue: '', children: [], collapsed: false };
  }
  if (typeof value === 'boolean') {
    return { id: _nodeId++, key, type: 'boolean', strValue: String(value), children: [], collapsed: false };
  }
  if (typeof value === 'number') {
    return { id: _nodeId++, key, type: 'number', strValue: String(value), children: [], collapsed: false };
  }
  if (typeof value === 'string') {
    return { id: _nodeId++, key, type: 'string', strValue: value, children: [], collapsed: false };
  }
  if (Array.isArray(value)) {
    return {
      id: _nodeId++, key, type: 'array', strValue: '', collapsed: false,
      children: value.map((item, i) => jsonToNode(String(i), item))
    };
  }
  if (typeof value === 'object') {
    return {
      id: _nodeId++, key, type: 'object', strValue: '', collapsed: false,
      children: Object.entries(value as Record<string, unknown>).map(([k, v]) => jsonToNode(k, v))
    };
  }
  return { id: _nodeId++, key, type: 'string', strValue: String(value), children: [], collapsed: false };
}

function nodeToJson(node: KbNode): unknown {
  switch (node.type) {
    case 'null':    return null;
    case 'boolean': return node.strValue === 'true';
    case 'number':  return Number(node.strValue);
    case 'string':  return node.strValue;
    case 'array':   return node.children.map(c => nodeToJson(c));
    case 'object': {
      const obj: Record<string, unknown> = {};
      for (const c of node.children) obj[c.key] = nodeToJson(c);
      return obj;
    }
  }
}

function blankDetails(): DetailsForm {
  return { restaurantName: '', description: '', address: '', phoneNumber: '', email: '', openingTime: '', closingTime: '', about: '' };
}

function configToForm(c: RestaurantConfig): DetailsForm {
  return {
    restaurantName: c.restaurantName ?? '',
    description:    c.description   ?? '',
    address:        c.address       ?? '',
    phoneNumber:    c.phoneNumber   ?? '',
    email:          c.email         ?? '',
    openingTime:    c.openingTime   ?? '',
    closingTime:    c.closingTime   ?? '',
    about:          c.about         ?? ''
  };
}

@Component({
  selector: 'app-admin-restaurant-config',
  imports: [CommonModule, NgTemplateOutlet, FormsModule],
  templateUrl: './admin-restaurant-config.html',
  styleUrl: './admin-restaurant-config.css'
})
export class AdminRestaurantConfig implements OnInit {

  private readonly svc  = inject(RestaurantConfigService);
  private readonly note = inject(NotificationServices);

  // ─── Page state ──────────────────────────────────────────────────────────────

  readonly isLoading     = signal(true);
  readonly config        = signal<RestaurantConfig | null>(null);
  readonly activeTab     = signal<'details' | 'knowledge'>('details');

  // ─── Details form ─────────────────────────────────────────────────────────────

  readonly detailsForm   = signal<DetailsForm>(blankDetails());
  readonly detailsEditing = signal(false);
  readonly isSavingDetails = signal(false);

  // ─── Knowledge base ───────────────────────────────────────────────────────────

  readonly kbNodes      = signal<KbNode[]>([]);   // root-level nodes (object fields)
  readonly kbRawMode    = signal(false);
  readonly kbRawText    = signal('');
  readonly kbRawError   = signal('');
  readonly isSavingKb   = signal(false);
  readonly kbEditing    = signal(false);

  // ─── Validation ──────────────────────────────────────────────────────────────

  readonly detailsErrors = computed(() => {
    const f = this.detailsForm();
    const errs: Partial<Record<keyof DetailsForm, string>> = {};
    if (!f.restaurantName.trim()) errs.restaurantName = 'Name is required.';
    if (f.restaurantName.trim().length > 100) errs.restaurantName = 'Max 100 characters.';
    if (f.description.length > 500)  errs.description = 'Max 500 characters.';
    if (f.address.length > 500)      errs.address = 'Max 500 characters.';
    if (f.phoneNumber.length > 20)   errs.phoneNumber = 'Max 20 characters.';
    if (f.about.length > 2000)       errs.about = 'Max 2000 characters.';
    if (f.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)) errs.email = 'Invalid email.';
    if (f.openingTime && f.closingTime && f.openingTime >= f.closingTime)
      errs.openingTime = 'Opening must be before closing time.';
    return errs;
  });

  readonly detailsValid = computed(() => Object.keys(this.detailsErrors()).length === 0);

  // ─── Lifecycle ────────────────────────────────────────────────────────────────

  ngOnInit(): void {
    this.loadConfig();
  }

  loadConfig(): void {
    this.isLoading.set(true);
    this.svc.getConfig().subscribe({
      next: (cfg) => {
        this.config.set(cfg);
        this.detailsForm.set(configToForm(cfg));
        this.initKbNodes(cfg.knowledgeBase);
        this.isLoading.set(false);
      },
      error: (err) => {
        if (err?.status === 404) {
          // not configured yet
          this.config.set(null);
          this.detailsEditing.set(true);
        } else {
          this.note.error(err?.error?.message ?? 'Failed to load restaurant config.');
        }
        this.isLoading.set(false);
      }
    });
  }

  // ─── Details ──────────────────────────────────────────────────────────────────

  startEditDetails(): void {
    const cfg = this.config();
    this.detailsForm.set(cfg ? configToForm(cfg) : blankDetails());
    this.detailsEditing.set(true);
  }

  cancelEditDetails(): void {
    const cfg = this.config();
    if (cfg) {
      this.detailsForm.set(configToForm(cfg));
      this.detailsEditing.set(false);
    }
  }

  updateDetails(key: keyof DetailsForm, value: string): void {
    this.detailsForm.update(f => ({ ...f, [key]: value }));
  }

  saveDetails(): void {
    if (!this.detailsValid()) return;
    this.isSavingDetails.set(true);
    const f = this.detailsForm();
    const req: UpdateRestaurantDetailsRequest = {
      restaurantName: f.restaurantName.trim(),
      description:    f.description.trim()  || null,
      address:        f.address.trim()       || null,
      phoneNumber:    f.phoneNumber.trim()   || null,
      email:          f.email.trim()         || null,
      openingTime:    f.openingTime.trim()   || null,
      closingTime:    f.closingTime.trim()   || null,
      about:          f.about.trim()         || null
    };
    this.svc.updateDetails(req).subscribe({
      next: (cfg) => {
        this.config.set(cfg);
        this.detailsEditing.set(false);
        this.isSavingDetails.set(false);
        this.note.success('Restaurant details saved.');
      },
      error: (err) => {
        this.isSavingDetails.set(false);
        this.note.error(err?.error?.message ?? 'Failed to save details.');
      }
    });
  }

  // ─── KB: init ─────────────────────────────────────────────────────────────────

  private initKbNodes(kb: unknown): void {
    if (kb === null || kb === undefined) {
      this.kbNodes.set([]);
      return;
    }
    if (Array.isArray(kb)) {
      this.kbNodes.set(kb.map((item, i) => jsonToNode(String(i), item)));
    } else if (typeof kb === 'object') {
      this.kbNodes.set(
        Object.entries(kb as Record<string, unknown>).map(([k, v]) => jsonToNode(k, v))
      );
    }
  }

  startEditKb(): void {
    this.kbEditing.set(true);
    this.kbRawMode.set(false);
    this.kbRawError.set('');
  }

  cancelEditKb(): void {
    const cfg = this.config();
    this.initKbNodes(cfg?.knowledgeBase ?? null);
    this.kbEditing.set(false);
    this.kbRawMode.set(false);
    this.kbRawError.set('');
  }

  // ─── KB: raw mode toggle ──────────────────────────────────────────────────────

  toggleRawMode(): void {
    if (!this.kbRawMode()) {
      // switching to raw — serialise current tree
      const obj = this.buildKbJson();
      this.kbRawText.set(JSON.stringify(obj, null, 2));
      this.kbRawError.set('');
      this.kbRawMode.set(true);
    } else {
      // switching back to tree — parse raw
      try {
        const parsed = JSON.parse(this.kbRawText());
        if (typeof parsed !== 'object' || typeof parsed === 'string') throw new Error('Must be object or array');
        this.initKbNodes(parsed);
        this.kbRawError.set('');
        this.kbRawMode.set(false);
      } catch (e: any) {
        this.kbRawError.set('Invalid JSON: ' + (e?.message ?? 'parse error'));
      }
    }
  }

  private buildKbJson(): Record<string, unknown> | null {
    const nodes = this.kbNodes();
    if (nodes.length === 0) return null;
    const obj: Record<string, unknown> = {};
    for (const n of nodes) obj[n.key || `field_${n.id}`] = nodeToJson(n);
    return obj;
  }

  saveKb(): void {
    let value: Record<string, unknown> | unknown[] | null;
    if (this.kbRawMode()) {
      const raw = this.kbRawText().trim();
      if (!raw) { value = null; }
      else {
        try {
          const parsed = JSON.parse(raw);
          if (typeof parsed !== 'object') throw new Error('Must be object or array');
          value = parsed;
        } catch (e: any) {
          this.kbRawError.set('Invalid JSON: ' + (e?.message ?? 'parse error'));
          return;
        }
      }
    } else {
      value = this.kbNodes().length === 0 ? null : this.buildKbJson();
    }

    this.isSavingKb.set(true);
    this.svc.updateKnowledgeBase({ value }).subscribe({
      next: (cfg) => {
        this.config.set(cfg);
        this.initKbNodes(cfg.knowledgeBase);
        this.kbEditing.set(false);
        this.kbRawMode.set(false);
        this.isSavingKb.set(false);
        this.note.success('Knowledge base saved.');
      },
      error: (err) => {
        this.isSavingKb.set(false);
        this.note.error(err?.error?.message ?? 'Failed to save knowledge base.');
      }
    });
  }

  // ─── KB: tree mutations ───────────────────────────────────────────────────────

  addRootNode(): void {
    this.kbNodes.update(nodes => [...nodes, newNode('', 'string')]);
  }

  removeRootNode(id: number): void {
    this.kbNodes.update(nodes => nodes.filter(n => n.id !== id));
  }

  updateNode(id: number, patch: Partial<KbNode>): void {
    this.kbNodes.update(nodes => this.patchNode(nodes, id, patch));
  }

  private patchNode(nodes: KbNode[], id: number, patch: Partial<KbNode>): KbNode[] {
    return nodes.map(n => {
      if (n.id === id) {
        const updated = { ...n, ...patch };
        // reset children/value when type changes
        if (patch.type && patch.type !== n.type) {
          updated.children = (patch.type === 'object' || patch.type === 'array') ? [] : [];
          updated.strValue = patch.type === 'boolean' ? 'true' : patch.type === 'null' ? '' : '';
        }
        return updated;
      }
      if (n.children.length) return { ...n, children: this.patchNode(n.children, id, patch) };
      return n;
    });
  }

  addChildNode(parentId: number): void {
    this.kbNodes.update(nodes => this.addChild(nodes, parentId));
  }

  private addChild(nodes: KbNode[], parentId: number): KbNode[] {
    return nodes.map(n => {
      if (n.id === parentId) {
        return { ...n, children: [...n.children, newNode('', 'string')] };
      }
      if (n.children.length) return { ...n, children: this.addChild(n.children, parentId) };
      return n;
    });
  }

  removeNode(id: number): void {
    this.kbNodes.update(nodes => this.deleteNode(nodes, id));
  }

  private deleteNode(nodes: KbNode[], id: number): KbNode[] {
    return nodes
      .filter(n => n.id !== id)
      .map(n => n.children.length ? { ...n, children: this.deleteNode(n.children, id) } : n);
  }

  toggleCollapse(id: number): void {
    this.kbNodes.update(nodes => this.patchNode(nodes, id, { collapsed: !this.findNode(nodes, id)?.collapsed }));
  }

  findNode(nodes: KbNode[], id: number): KbNode | null {
    for (const n of nodes) {
      if (n.id === id) return n;
      if (n.children.length) { const found = this.findNode(n.children, id); if (found) return found; }
    }
    return null;
  }

  // ─── Helpers ─────────────────────────────────────────────────────────────────

  readonly NODE_TYPES: KbNodeType[] = ['string', 'number', 'boolean', 'null', 'object', 'array'];

  readonly String = String;

  isContainer(type: KbNodeType): boolean {
    return type === 'object' || type === 'array';
  }

  kbPreviewText(): string {
    const kb = this.config()?.knowledgeBase;
    if (!kb) return '';
    return JSON.stringify(kb, null, 2);
  }
}
