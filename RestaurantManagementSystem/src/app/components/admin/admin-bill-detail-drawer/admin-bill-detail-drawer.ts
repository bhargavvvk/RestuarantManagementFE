import { DecimalPipe } from '@angular/common';
import { Component, computed, input, output } from '@angular/core';
import { AdminBillDetail } from '../../../models/admin-bill.models';
import { formatTime12Hour } from '../../../utils/date.utils';

@Component({
  selector: 'app-admin-bill-detail-drawer',
  imports: [DecimalPipe],
  templateUrl: './admin-bill-detail-drawer.html',
  styleUrl: './admin-bill-detail-drawer.css',
})
export class AdminBillDetailDrawer {
  readonly isOpen = input.required<boolean>();
  readonly bill = input<AdminBillDetail | null>(null);
  readonly loading = input(false);

  readonly closed = output<void>();

  readonly isPaid = computed(() => {
    const detail = this.bill();
    if (!detail) return false;
    return detail.paymentStatus?.toLowerCase() === 'paid';
  });

  readonly paymentStatusLabel = computed(() => {
    const detail = this.bill();
    if (!detail) return '';
    return this.isPaid() ? 'Paid' : 'Pending Payment';
  });

  readonly paymentMethodLabel = computed(() => {
    const detail = this.bill();
    if (!detail) return '';
    // paymentMethod is now a string from the API; null means not yet paid
    return detail.paymentMethod ?? 'Payment Pending';
  });

  formatTime(date: string): string {
    return formatTime12Hour(date);
  }
}
