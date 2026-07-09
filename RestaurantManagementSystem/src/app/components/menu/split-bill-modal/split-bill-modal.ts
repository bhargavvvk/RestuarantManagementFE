import { Component, EventEmitter, inject, Input, OnInit, Output, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MenuService } from '../../../services/menu-service';
import { WaiterTableService } from '../../../services/waiter-table';
import { SplitBillResponse, ItemSplitOption } from '../../../models/customer.models';
import { NotificationServices } from '../../../services/notification-services';

type TabType = 'equal' | 'order' | 'item';

@Component({
  selector: 'app-split-bill-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './split-bill-modal.html',
  styleUrl: './split-bill-modal.css'
})
export class SplitBillModal implements OnInit {
  @Input() tableId?: number;
  @Input() role: 'Customer' | 'Waiter' = 'Customer';
  @Output() close = new EventEmitter<void>();

  private readonly menuService = inject(MenuService);
  private readonly waiterTableService = inject(WaiterTableService);
  private readonly notification = inject(NotificationServices);

  readonly activeTab = signal<TabType>('equal');
  readonly splitData = signal<SplitBillResponse | null>(null);
  readonly isLoading = signal(true);

  // Equal Split guest count
  readonly guestCount = signal(2);

  // Item Split selected item IDs
  readonly selectedItemIds = signal<number[]>([]);

  // Custom Item Groups
  readonly createdGroups = signal<any[]>([]);

  ngOnInit(): void {
    this.loadSplitData();
  }

  loadSplitData(): void {
    this.isLoading.set(true);
    const request$ = this.role === 'Waiter' && this.tableId !== undefined
      ? this.waiterTableService.getSplitBill(this.tableId)
      : this.menuService.getSplitBill();

    request$.subscribe({
      next: (data) => {
        this.splitData.set(data);
        if (data.customSplitsJson) {
          try {
            const parsed = JSON.parse(data.customSplitsJson);
            if (parsed.splitType) {
              this.activeTab.set(parsed.splitType);
            }
            if (parsed.guestCount) {
              this.guestCount.set(parsed.guestCount);
            }
            if (parsed.groups) {
              this.createdGroups.set(parsed.groups);
            }
          } catch (e) {
            console.error('Failed to parse saved custom splits', e);
          }
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        this.notification.error(err.error?.message ?? 'Failed to load split details');
        this.isLoading.set(false);
        this.close.emit();
      }
    });
  }

  setTab(tab: TabType): void {
    this.activeTab.set(tab);
  }

  // Available items not yet added to any sub-bill group
  readonly availableItems = computed(() => {
    const data = this.splitData();
    if (!data) return [];
    const assignedIds = new Set(this.createdGroups().flatMap(g => g.items.map((i: any) => i.orderItemId)));
    return data.itemSplits.filter(item => !assignedIds.has(item.orderItemId));
  });

  toggleItemSelection(itemId: number): void {
    const current = this.selectedItemIds();
    if (current.includes(itemId)) {
      this.selectedItemIds.set(current.filter(id => id !== itemId));
    } else {
      this.selectedItemIds.set([...current, itemId]);
    }
  }

  // Create a new sub-bill group from selected items
  addGroup(): void {
    const selectedIds = this.selectedItemIds();
    if (selectedIds.length === 0) return;

    const data = this.splitData();
    if (!data) return;

    const itemsInGroup = data.itemSplits.filter(item => selectedIds.includes(item.orderItemId));
    const foodTotal = itemsInGroup.reduce((sum, item) => sum + item.foodTotal, 0);
    const cgst = itemsInGroup.reduce((sum, item) => sum + item.cgstAmount, 0);
    const sgst = itemsInGroup.reduce((sum, item) => sum + item.sgstAmount, 0);
    const serviceCharge = itemsInGroup.reduce((sum, item) => sum + item.serviceChargeAmount, 0);
    const grandTotal = itemsInGroup.reduce((sum, item) => sum + item.grandTotal, 0);

    const groupName = `Group ${this.createdGroups().length + 1}`;
    const newGroup = {
      name: groupName,
      items: itemsInGroup.map(item => ({
        orderItemId: item.orderItemId,
        itemName: item.itemName,
        itemPrice: item.itemPrice,
        quantity: item.quantity,
        grandTotal: item.grandTotal
      })),
      foodTotal,
      cgstAmount: cgst,
      sgstAmount: sgst,
      serviceChargeAmount: serviceCharge,
      grandTotal
    };

    this.createdGroups.set([...this.createdGroups(), newGroup]);
    this.selectedItemIds.set([]);
  }

  removeGroup(index: number): void {
    const current = this.createdGroups();
    const updated = current.filter((_, i) => i !== index);
    const renamed = updated.map((group, i) => ({
      ...group,
      name: `Group ${i + 1}`
    }));
    this.createdGroups.set(renamed);
  }

  // Calculate Equal Split dynamic value
  readonly equalShareAmount = computed(() => {
    const total = this.splitData()?.grandTotal ?? 0;
    const guests = this.guestCount();
    return guests > 0 ? (total / guests) : 0;
  });

  // Calculate Item-wise Split dynamically based on selected checkboxes (for current selection summary)
  readonly selectedItemsSummary = computed(() => {
    const data = this.splitData();
    if (!data) return null;

    const selectedIds = this.selectedItemIds();
    const selectedItems = data.itemSplits.filter(item => selectedIds.includes(item.orderItemId));

    const foodTotal = selectedItems.reduce((sum, item) => sum + item.foodTotal, 0);
    const cgst = selectedItems.reduce((sum, item) => sum + item.cgstAmount, 0);
    const sgst = selectedItems.reduce((sum, item) => sum + item.sgstAmount, 0);
    const serviceCharge = selectedItems.reduce((sum, item) => sum + item.serviceChargeAmount, 0);
    const grandTotal = selectedItems.reduce((sum, item) => sum + item.grandTotal, 0);

    return {
      count: selectedItems.length,
      foodTotal,
      cgst,
      sgst,
      serviceCharge,
      grandTotal
    };
  });

  saveSplit(): void {
    const active = this.activeTab();
    const data = this.splitData();
    if (!data) {
      this.close.emit();
      return;
    }

    if (active === 'item') {
      if (this.selectedItemIds().length > 0) {
        this.addGroup();
      }

      const remaining = this.availableItems();
      if (remaining.length > 0) {
        const foodTotal = remaining.reduce((sum, item) => sum + item.foodTotal, 0);
        const cgst = remaining.reduce((sum, item) => sum + item.cgstAmount, 0);
        const sgst = remaining.reduce((sum, item) => sum + item.sgstAmount, 0);
        const serviceCharge = remaining.reduce((sum, item) => sum + item.serviceChargeAmount, 0);
        const grandTotal = remaining.reduce((sum, item) => sum + item.grandTotal, 0);

        const groupName = `Group ${this.createdGroups().length + 1}`;
        const newGroup = {
          name: groupName,
          items: remaining.map(item => ({
            orderItemId: item.orderItemId,
            itemName: item.itemName,
            itemPrice: item.itemPrice,
            quantity: item.quantity,
            grandTotal: item.grandTotal
          })),
          foodTotal,
          cgstAmount: cgst,
          sgstAmount: sgst,
          serviceChargeAmount: serviceCharge,
          grandTotal
        };
        this.createdGroups.set([...this.createdGroups(), newGroup]);
      }
    }

    const payload = {
      splitType: active,
      guestCount: active === 'equal' ? this.guestCount() : null,
      equalShare: active === 'equal' ? this.equalShareAmount() : null,
      groups: active === 'item' ? this.createdGroups() : null,
      orderSplits: active === 'order' ? data.orderSplits.map(os => ({
        orderNumber: os.orderNumber,
        grandTotal: os.grandTotal,
        foodTotal: os.foodTotal,
        cgstAmount: os.cgstAmount,
        sgstAmount: os.sgstAmount,
        serviceChargeAmount: os.serviceChargeAmount,
        items: os.items
      })) : null
    };

    const jsonStr = JSON.stringify(payload);

    const save$ = this.role === 'Waiter' && this.tableId !== undefined
      ? this.waiterTableService.saveSplitBill(this.tableId, jsonStr)
      : this.menuService.saveSplitBill(jsonStr);

    save$.subscribe({
      next: () => {
        if (this.role === 'Customer') {
          this.menuService.loadOrderData();
        } else if (this.role === 'Waiter' && this.tableId !== undefined) {
          this.waiterTableService.getBill(this.tableId).subscribe(b => {
            this.waiterTableService.bill.set(b);
          });
        }
        this.close.emit();
      },
      error: () => {
        this.notification.error('Failed to save split details');
      }
    });
  }

  closeModal(): void {
    this.close.emit();
  }
}
