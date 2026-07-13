import { Component, computed, effect, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WaiterTableService } from '../../../services/waiter-table';
import { ActivatedRoute, Router } from '@angular/router';
import { NotificationServices } from '../../../services/notification-services';
import { Waiter } from '../../../services/waiter';
import { SplitBillModal } from '../../menu/split-bill-modal/split-bill-modal';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-waiter-bill',
  imports: [CommonModule, SplitBillModal, FormsModule],
  templateUrl: './waiter-bill.html',
  styleUrl: './waiter-bill.css',
})
export class WaiterBill implements OnInit {

  getParsedSplits() {
    const b = this.bill();
    if (!b || !b.customSplitsJson) return null;
    try {
      return JSON.parse(b.customSplitsJson);
    } catch {
      return null;
    }
  }

  private readonly waiterTableService = inject(WaiterTableService);
  private readonly waiterService = inject(Waiter);
  private readonly route = inject(ActivatedRoute);
  private readonly notification = inject(NotificationServices);
  private readonly router = inject(Router);

  readonly splitVisible = signal(false);
  readonly showLinkPanel = signal(false);
  readonly linkedTableIds = signal<number[]>([]);
  readonly selectedTableToLink = signal<number | null>(null);

  readonly tableId = Number(
    this.route.snapshot.paramMap.get('tableId')
  );

  readonly bill = this.waiterTableService.bill;

  readonly paymentMethods =
    this.waiterTableService.paymentMethods;

  readonly selectedPaymentMethod = signal<number | null>(null);

  readonly availableTablesToLink = computed(() => {
    const all = this.waiterService.tables();
    const linked = this.linkedTableIds();
    return all.filter(t =>
      t.tableId !== this.tableId &&
      t.status.toLowerCase() === 'available' &&
      !linked.includes(t.tableId)
    );
  });

  readonly linkedTableDetails = computed(() => {
    const linked = this.linkedTableIds();
    const all = this.waiterService.tables();
    return all.filter(t => linked.includes(t.tableId));
  });

  constructor() {
    effect(() => {
      const methods = this.paymentMethods();
      if (methods.length > 0 && this.selectedPaymentMethod() === null) {
        this.selectedPaymentMethod.set(methods[0].value);
      }
    });
  }

  ngOnInit(): void {
    this.loadLinkedTables();
  }

  loadLinkedTables(): void {
    this.waiterTableService.getLinkedTables(this.tableId).subscribe({
      next: ids => this.linkedTableIds.set(ids),
      error: () => {}
    });
  }

  toggleLinkPanel(): void {
    this.showLinkPanel.update(v => !v);
  }

  linkSelectedTable(): void {
    const secondId = this.selectedTableToLink();
    if (secondId === null) return;
    this.waiterTableService.linkTable(this.tableId, secondId).subscribe({
      next: ids => {
        this.linkedTableIds.set(ids);
        this.selectedTableToLink.set(null);
        this.notification.success('Table linked successfully');
      },
      error: err => this.notification.error(err.error?.Message || 'Failed to link table')
    });
  }

  unlinkTable(secondaryTableId: number): void {
    this.waiterTableService.unlinkTable(this.tableId, secondaryTableId).subscribe({
      next: () => {
        this.linkedTableIds.update(ids => ids.filter(id => id !== secondaryTableId));
        this.notification.success('Table unlinked');
      },
      error: err => this.notification.error(err.error?.Message || 'Failed to unlink table')
    });
  }

  onPaymentMethodChange(
    event: Event
  ): void {

    this.selectedPaymentMethod.set(
      Number(
        (event.target as HTMLSelectElement).value
      )
    );

  }

  markPaid(): void {

    if (this.selectedPaymentMethod() === null) {
      return;
    }

    this.waiterTableService
      .markBillPaid(
        this.tableId,
        this.selectedPaymentMethod()!
      )
      .subscribe({

        next: bill => {

          this.waiterTableService
            .updateBill(bill);

        },

        error: err => {

          this.notification.error(
            err.error?.Message
          );

        }

      });

  }

  readonly tablePaymentMethods = signal<{ [tableId: number]: number }>({});

  onTablePaymentMethodChange(tableId: number, event: Event): void {
    const value = Number((event.target as HTMLSelectElement).value);
    this.tablePaymentMethods.update(current => ({
      ...current,
      [tableId]: value
    }));
  }

  getTablePaymentMethod(tableId: number): number {
    const methods = this.tablePaymentMethods();
    if (methods[tableId] !== undefined) {
      return methods[tableId];
    }
    const pm = this.paymentMethods();
    return pm.length > 0 ? pm[0].value : 0;
  }

  markTableSplitPaid(targetTableId: number): void {
    const paymentMethod = this.getTablePaymentMethod(targetTableId);

    this.waiterTableService
      .markTableSplitPaid(this.tableId, targetTableId, paymentMethod)
      .subscribe({
        next: bill => {
          this.waiterTableService.updateBill(bill);
          this.notification.success(`Table ${targetTableId} split marked as paid.`);
        },
        error: err => {
          this.notification.error(err.error?.Message || 'Failed to mark split as paid');
        }
      });
  }

  closeSession(): void {

    this.waiterTableService
      .closeSession(this.tableId)
      .subscribe({

        next: () => {

          this.waiterService.setTableAvailable(
            this.tableId
          );

          this.router.navigate(['/waiter']);

        },

        error: err => {

          this.notification.error(
            err.error?.Message
          );

        }

      });

  }

}