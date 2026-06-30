import { Component, input, output } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { AdminOrderDetail } from '../../../models/admin-order.models';
import { formatTime12Hour } from '../../../utils/date.utils';

@Component({
  selector: 'app-admin-order-detail-drawer',
  imports: [DecimalPipe],
  templateUrl: './admin-order-detail-drawer.html',
  styleUrl: './admin-order-detail-drawer.css',
})
export class AdminOrderDetailDrawer {
  readonly isOpen = input.required<boolean>();
  readonly order = input<AdminOrderDetail | null>(null);
  readonly loading = input(false);

  readonly closed = output<void>();

  formatTime(date: string): string {
    return formatTime12Hour(date);
  }

  getStatusClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'active':
        return 'status-active';
      case 'completed':
        return 'status-completed';
      case 'cancelled':
        return 'status-cancelled';
      default:
        return '';
    }
  }
}
