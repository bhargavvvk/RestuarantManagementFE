import { Component, input, output } from '@angular/core';
import { AdminOrderListItem } from '../../../models/admin-order.models';
import { formatTime12Hour } from '../../../utils/date.utils';

@Component({
  selector: 'app-admin-orders-table',
  imports: [],
  templateUrl: './admin-orders-table.html',
  styleUrl: './admin-orders-table.css',
})
export class AdminOrdersTable {
  readonly orders = input.required<AdminOrderListItem[]>();
  readonly selectedOrderId = input<number | null>(null);
  readonly loading = input(false);
  readonly paginationLabel = input('');
  readonly hasPreviousPage = input(false);
  readonly hasNextPage = input(false);

  readonly viewDetails = output<number>();
  readonly previousPage = output<void>();
  readonly nextPage = output<void>();

  formatTime(date: string): string {
    return formatTime12Hour(date);
  }

  isSelected(orderId: number): boolean {
    return this.selectedOrderId() === orderId;
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
