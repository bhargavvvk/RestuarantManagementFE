import { Component, effect, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WaiterTableService } from '../../../services/waiter-table';
import { ActivatedRoute, Router } from '@angular/router';
import { NotificationServices } from '../../../services/notification-services';
import { Waiter } from '../../../services/waiter';
import { SplitBillModal } from '../../menu/split-bill-modal/split-bill-modal';

@Component({
  selector: 'app-waiter-bill',
  imports: [CommonModule, SplitBillModal],
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

  readonly tableId = Number(
    this.route.snapshot.paramMap.get('tableId')
  );

  readonly bill = this.waiterTableService.bill;

  readonly paymentMethods =
    this.waiterTableService.paymentMethods;

  readonly selectedPaymentMethod = signal<number | null>(null);

  constructor() {
    effect(() => {
      const methods = this.paymentMethods();
      if (methods.length > 0 && this.selectedPaymentMethod() === null) {
        this.selectedPaymentMethod.set(methods[0].value);
      }
    });
  }

  ngOnInit(): void {}

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