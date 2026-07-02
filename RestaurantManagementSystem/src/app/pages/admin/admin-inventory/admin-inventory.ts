import { Component, inject, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

import { AdminInventory as AdminInventoryService } from '../../../services/admin/admin-inventory';
import { NotificationServices } from '../../../services/notification-services';
import {
  InventoryItem,
  InventorySearchParams,
  InventorySummary,
  CreateInventoryItemRequest,
} from '../../../models/admin-inventory.model';
import { AdminAddInventoryModal } from '../../../components/admin/admin-add-inventory-modal/admin-add-inventory-modal';

// Tracks which cell is being inline-edited
interface EditingCell {
  itemId: number;
  field: 'quantity' | 'threshold';
  value: number;
  saving: boolean;
}

@Component({
  selector: 'app-admin-inventory',
  imports: [CommonModule, FormsModule, AdminAddInventoryModal],
  templateUrl: './admin-inventory.html',
  styleUrl: './admin-inventory.css',
})
export class AdminInventory implements OnInit, OnDestroy {

  private readonly inventoryService = inject(AdminInventoryService);
  private readonly notificationService = inject(NotificationServices);

  readonly items      = signal<InventoryItem[]>([]);
  readonly summary    = signal<InventorySummary>({ totalItems: 0, lowStockItems: 0 });
  readonly isLoading  = signal(false);
  readonly totalCount = signal(0);

  readonly editingCell = signal<EditingCell | null>(null);

  readonly searchText   = signal('');
  readonly lowStockOnly = signal(false);
  readonly pageNumber   = signal(1);
  readonly pageSize     = 10;

  readonly showAddModal = signal(false);

  private readonly searchInput$ = new Subject<string>();
  private searchSub?: Subscription;

  private readonly fetch$ = new Subject<InventorySearchParams>();
  private fetchSub?: Subscription;

  ngOnInit(): void {
    this.setupFetchPipeline();
    this.setupSearchDebounce();
    this.fetchItems();
  }

  ngOnDestroy(): void {
    this.fetchSub?.unsubscribe();
    this.searchSub?.unsubscribe();
  }


  private setupFetchPipeline(): void {
    this.fetchSub = this.fetch$.pipe(
      switchMap(params => {
        this.isLoading.set(true);
        return this.inventoryService.getInventory(params).pipe(
          catchError(err => {
            const msg = err?.error?.message ?? 'Failed to load inventory.';
            this.notificationService.error(msg);
            return of(null);
          })
        );
      })
    ).subscribe(res => {
      this.isLoading.set(false);
      if (!res) return;
      this.summary.set(res.summary);
      this.items.set(res.items.items);
      this.totalCount.set(res.items.totalCount);
    });
  }

  private setupSearchDebounce(): void {
    this.searchSub = this.searchInput$.pipe(
      debounceTime(500),
      distinctUntilChanged()
    ).subscribe(() => {
      this.pageNumber.set(1);
      this.fetchItems();
    });
  }


  private fetchItems(): void {
    const params: InventorySearchParams = {
      search:       this.searchText().trim() || undefined,
      lowStockOnly: this.lowStockOnly(),
      pageNumber:   this.pageNumber(),
      pageSize:     this.pageSize,
    };
    this.fetch$.next(params);
  }

  reload(): void {
    this.fetchItems();
  }


  onSearch(value: string): void {
    this.searchText.set(value);
    this.searchInput$.next(value);
  }

  clearSearch(input: HTMLInputElement): void {
    input.value = '';
    this.onSearch('');
  }


  filterAll(): void {
    this.lowStockOnly.set(false);
    this.pageNumber.set(1);
    this.fetchItems();
  }

  filterLowStock(): void {
    this.lowStockOnly.set(true);
    this.pageNumber.set(1);
    this.fetchItems();
  }


  get totalPages(): number {
    return Math.ceil(this.totalCount() / this.pageSize);
  }

  get showingFrom(): number {
    return this.totalCount() === 0 ? 0 : (this.pageNumber() - 1) * this.pageSize + 1;
  }

  get showingTo(): number {
    return Math.min(this.pageNumber() * this.pageSize, this.totalCount());
  }

  prevPage(): void {
    if (this.pageNumber() <= 1) return;
    this.pageNumber.update(p => p - 1);
    this.fetchItems();
  }

  nextPage(): void {
    if (this.pageNumber() >= this.totalPages) return;
    this.pageNumber.update(p => p + 1);
    this.fetchItems();
  }


  isLowStock(item: InventoryItem): boolean {
    return item.thresholdQuantity > 0 && item.currentQuantity <= item.thresholdQuantity;
  }

  formatUpdatedAt(dateStr: string): string {
    const date = new Date(dateStr);
    const now  = new Date();
    const diffMs   = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${Math.floor(diffHours / 24)}d ago`;
  }

  isEditing(itemId: number, field: 'quantity' | 'threshold'): boolean {
    const c = this.editingCell();
    return c?.itemId === itemId && c?.field === field;
  }

  isSaving(itemId: number, field: 'quantity' | 'threshold'): boolean {
    const c = this.editingCell();
    return c?.itemId === itemId && c?.field === field && (c?.saving ?? false);
  }


  startEdit(item: InventoryItem, field: 'quantity' | 'threshold'): void {
    this.editingCell.set({
      itemId: item.id,
      field,
      value: field === 'quantity' ? item.currentQuantity : item.thresholdQuantity,
      saving: false,
    });
  }

  cancelEdit(): void {
    this.editingCell.set(null);
  }

  updateEditValue(value: number): void {
    this.editingCell.update(c => c ? { ...c, value } : null);
  }

  commitEdit(item: InventoryItem): void {
    const cell = this.editingCell();
    if (!cell || cell.saving) return;

    this.editingCell.update(c => c ? { ...c, saving: true } : null);

    const obs = cell.field === 'quantity'
      ? this.inventoryService.updateQuantity(item.id, { quantity: cell.value })
      : this.inventoryService.updateThreshold(item.id, { thresholdQuantity: cell.value });

    obs.subscribe({
      next: () => {
        this.editingCell.set(null);
        this.notificationService.success(
          cell.field === 'quantity' ? 'Quantity updated.' : 'Threshold updated.'
        );
        this.reload();
      },
      error: err => {
        const msg = err?.error?.message ?? 'Update failed.';
        this.notificationService.error(msg);
        this.editingCell.update(c => c ? { ...c, saving: false } : null);
      }
    });
  }


  openAddModal(): void {
    this.showAddModal.set(true);
  }

  closeAddModal(): void {
    this.showAddModal.set(false);
  }

  onAddItem(request: CreateInventoryItemRequest): void {
    this.inventoryService.createItem(request).subscribe({
      next: () => {
        this.closeAddModal();
        this.notificationService.success('Item added to inventory.');
        this.reload();
      },
      error: err => {
        const msg = err?.error?.message ?? 'Failed to add item.';
        this.notificationService.error(msg);
        this.closeAddModal();
      }
    });
  }


  onDeleteItem(item: InventoryItem): void {
    const confirmed = window.confirm(
      `Delete "${item.itemName}" from inventory? This cannot be undone.`
    );
    if (!confirmed) return;

    this.inventoryService.deleteItem(item.id).subscribe({
      next: () => {
        this.notificationService.success(`"${item.itemName}" deleted.`);
        this.reload();
      },
      error: err => {
        const msg = err?.error?.message ?? 'Failed to delete item.';
        this.notificationService.error(msg);
      }
    });
  }
}
