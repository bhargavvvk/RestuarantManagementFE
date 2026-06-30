import { DecimalPipe } from '@angular/common';
import { Component, computed, input, output } from '@angular/core';
import { AdminTableBill } from '../../../models/admin-table.models';

@Component({
  selector: 'app-admin-bill-summary',
  imports: [DecimalPipe],
  templateUrl: './admin-bill-summary.html',
  styleUrl: './admin-bill-summary.css',
})
export class AdminBillSummary {
  readonly bill = input<AdminTableBill | null>(null);

  readonly serviceChargeToggle = output<boolean>();
  readonly printRequested = output<void>();

  readonly isServiceChargeIncluded = computed(() => {
    const bill = this.bill();
    return !!bill && bill.serviceChargeAmount > 0;
  });

  readonly paymentStatusLabel = computed(() =>
    this.bill()?.paymentStatus === 1 ? 'Paid' : 'Pending Payment'
  );

  onServiceChargeToggle(event: Event): void {
    const includeServiceCharge = (event.target as HTMLInputElement).checked;
    this.serviceChargeToggle.emit(includeServiceCharge);
  }

  onPrint(): void {
    this.printRequested.emit();
  }
}
