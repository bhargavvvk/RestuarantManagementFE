import { Component, effect, input, output, signal, computed } from '@angular/core';
import {
  Ingredient,
  MenuItemIngredient,
  MenuItemIngredientEntry,
  UpdateMenuItemIngredientsRequest
} from '../../../models/admin-menu.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

/** A saved row shown in read/edit mode */
interface SavedRow {
  _rowId: number;
  ingredientId: number;
  ingredientName: string;
  approxQuantity: string;
  unit: string;
  editing: boolean;
  // editable copies (only used when editing === true)
  editQty: string;
  editUnit: string;
}

/** A new row being added */
interface NewRow {
  _rowId: number;
  mode: 'existing' | 'new';
  ingredientId: number | null;
  newName: string;
  newDescription: string;
  approxQuantity: string;
  unit: string;
}

let _nextId = 1;

function blankNewRow(): NewRow {
  return {
    _rowId: _nextId++,
    mode: 'existing',
    ingredientId: null,
    newName: '',
    newDescription: '',
    approxQuantity: '',
    unit: ''
  };
}

@Component({
  selector: 'app-admin-menu-ingredients-modal',
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-menu-ingredients-modal.html',
  styleUrl: './admin-menu-ingredients-modal.css'
})
export class AdminMenuIngredientsModal {

  readonly isOpen       = input(false);
  readonly menuItemName = input('');
  readonly ingredients  = input<Ingredient[]>([]);
  readonly currentList  = input<MenuItemIngredient[]>([]);
  readonly isLoading    = input(false);
  readonly isSaving     = input(false);

  readonly save  = output<UpdateMenuItemIngredientsRequest>();
  readonly close = output<void>();

  readonly savedRows = signal<SavedRow[]>([]);
  readonly newRows   = signal<NewRow[]>([]);

  constructor() {
    effect(() => {
      const open  = this.isOpen();
      const saved = this.currentList();
      if (open) {
        this.savedRows.set(
          saved.map(item => ({
            _rowId: _nextId++,
            ingredientId: item.ingredientId,
            ingredientName: item.ingredientName,
            approxQuantity: item.approxQuantity != null ? String(item.approxQuantity) : '',
            unit: item.unit ?? '',
            editing: false,
            editQty: item.approxQuantity != null ? String(item.approxQuantity) : '',
            editUnit: item.unit ?? ''
          }))
        );
        this.newRows.set([]);
      }
    });
  }

  // ─── Saved rows: edit / delete ────────────────────────────────────────────────

  startEdit(rowId: number): void {
    this.savedRows.update(rows =>
      rows.map(r => r._rowId === rowId
        ? { ...r, editing: true, editQty: r.approxQuantity, editUnit: r.unit }
        : r)
    );
  }

  cancelEdit(rowId: number): void {
    this.savedRows.update(rows =>
      rows.map(r => r._rowId === rowId ? { ...r, editing: false } : r)
    );
  }

  commitEdit(rowId: number): void {
    this.savedRows.update(rows =>
      rows.map(r => {
        if (r._rowId !== rowId) return r;
        const qty = String(r.editQty ?? '').trim();
        const unit = r.editUnit.trim();
        return { ...r, approxQuantity: qty, unit, editing: false };
      })
    );
  }

  updateEditField(rowId: number, field: 'editQty' | 'editUnit', value: string | number | null): void {
    this.savedRows.update(rows =>
      rows.map(r => r._rowId === rowId ? { ...r, [field]: value == null ? '' : String(value) } : r)
    );
  }

  deleteSaved(rowId: number): void {
    this.savedRows.update(rows => rows.filter(r => r._rowId !== rowId));
  }

  editQtyError(row: SavedRow): string | null {
    const qty = String(row.editQty ?? '').trim();
    if (qty === '') return null;
    if (isNaN(Number(qty)) || Number(qty) <= 0) return 'Must be > 0';
    return null;
  }

  // ─── New rows ─────────────────────────────────────────────────────────────────

  addNewRow(): void {
    if (this.savedRows().length + this.newRows().length >= 30) return;
    this.newRows.update(r => [...r, blankNewRow()]);
  }

  removeNewRow(rowId: number): void {
    this.newRows.update(r => r.filter(e => e._rowId !== rowId));
  }

  updateNewRow(rowId: number, patch: Partial<NewRow>): void {
    if (patch.approxQuantity != null) {
      patch = { ...patch, approxQuantity: String(patch.approxQuantity) };
    }
    this.newRows.update(r => r.map(e => e._rowId === rowId ? { ...e, ...patch } : e));
  }

  setMode(rowId: number, mode: 'existing' | 'new'): void {
    this.newRows.update(r =>
      r.map(e => e._rowId === rowId
        ? { ...e, mode, ingredientId: null, newName: '', newDescription: '' }
        : e)
    );
  }

  // ─── Dropdown: exclude ingredients already used ───────────────────────────────

  availableFor(rowId: number): Ingredient[] {
    const usedInSaved = new Set(this.savedRows().map(r => r.ingredientId));
    const usedInNew = new Set(
      this.newRows()
        .filter(r => r._rowId !== rowId && r.mode === 'existing' && r.ingredientId != null)
        .map(r => r.ingredientId!)
    );
    return this.ingredients().filter(i => !usedInSaved.has(i.id) && !usedInNew.has(i.id));
  }

  // ─── Validation ──────────────────────────────────────────────────────────────

  readonly newRowErrors = computed<Map<number, string>>(() => {
    const errors = new Map<number, string>();
    const usedInSaved = new Set(this.savedRows().map(r => r.ingredientId));
    const usedIds = new Set<number>();

    for (const row of this.newRows()) {
      if (row.mode === 'existing') {
        if (!row.ingredientId) { errors.set(row._rowId, 'Select an ingredient.'); continue; }
        if (usedInSaved.has(row.ingredientId) || usedIds.has(row.ingredientId)) {
          errors.set(row._rowId, 'Ingredient already in list.'); continue;
        }
        usedIds.add(row.ingredientId);
      } else {
        if (!row.newName.trim()) { errors.set(row._rowId, 'Name is required.'); continue; }
        if (row.newName.trim().length > 100) { errors.set(row._rowId, 'Name ≤ 100 chars.'); continue; }
      }
      const qty = String(row.approxQuantity ?? '').trim();
      if (qty !== '' && (isNaN(Number(qty)) || Number(qty) <= 0)) {
        errors.set(row._rowId, 'Quantity must be > 0.'); continue;
      }
      if (row.unit.trim().length > 20) {
        errors.set(row._rowId, 'Unit ≤ 20 chars.'); continue;
      }
    }
    return errors;
  });

  readonly hasSavedEditErrors = computed(() =>
    this.savedRows().some(r => r.editing && this.editQtyError(r) !== null)
  );

  readonly isValid = computed(() =>
    this.newRowErrors().size === 0 &&
    !this.hasSavedEditErrors() &&
    !this.savedRows().some(r => r.editing) // must commit edits first
  );

  // ─── Save ────────────────────────────────────────────────────────────────────

  onSave(): void {
    if (!this.isValid()) return;

    const entries: MenuItemIngredientEntry[] = [
      ...this.savedRows().map(r => ({
        ingredientId: r.ingredientId,
        approxQuantity: r.approxQuantity !== '' ? Number(r.approxQuantity) : null,
        unit: r.unit || null
      })),
      ...this.newRows().map(row => {
        const qty = String(row.approxQuantity ?? '').trim();
        const approxQuantity = qty !== '' ? Number(qty) : null;
        const unit = row.unit.trim() || null;
        if (row.mode === 'existing') {
          return { ingredientId: row.ingredientId!, approxQuantity, unit };
        } else {
          return {
            newIngredient: { name: row.newName.trim(), description: row.newDescription.trim() || null },
            approxQuantity,
            unit
          };
        }
      })
    ];

    this.save.emit({ ingredients: entries });
  }

  clearAll(): void {
    if (!confirm('Remove all ingredients from this menu item?')) return;
    this.save.emit({ ingredients: [] });
  }

  onClose(): void {
    this.savedRows.set([]);
    this.newRows.set([]);
    this.close.emit();
  }

  get totalRows(): number {
    return this.savedRows().length + this.newRows().length;
  }
}
