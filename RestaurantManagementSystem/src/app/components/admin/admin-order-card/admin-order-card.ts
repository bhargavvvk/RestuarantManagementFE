import { Component, computed, input, output } from '@angular/core';
import {
  AdminTableOrder,
  AdminTableOrderItem,
  OrderItemStatus,
} from '../../../models/admin-table.models';
import { formatTime12Hour } from '../../../utils/date.utils';

@Component({
  selector: 'app-admin-order-card',
  imports: [],
  templateUrl: './admin-order-card.html',
  styleUrl: './admin-order-card.css',
})
export class AdminOrderCard {
  readonly order = input.required<AdminTableOrder>();

  readonly cancelOrder = output<number>();
  readonly cancelItem = output<{ orderId: number; orderItemId: number }>();
  readonly reduceQuantity = output<{ orderId: number; item: AdminTableOrderItem }>();

  readonly accentClass = computed(() => {
    const statuses = this.order().items.map(item => item.status);

    if (statuses.some(status => status === OrderItemStatus.Preparing)) {
      return 'accent-preparing';
    }

    if (statuses.some(status => status === OrderItemStatus.Ready)) {
      return 'accent-ready';
    }

    return '';
  });

  readonly canCancelOrder = computed(() => {
    const items = this.order().items;
    return (
      items.length > 0 &&
      items.every(item => item.status === OrderItemStatus.Placed)
    );
  });

  formatTime = formatTime12Hour;

  getItemStatus(status: number): string {
    switch (status) {
      case OrderItemStatus.Placed:
        return 'PLACED';
      case OrderItemStatus.Preparing:
        return 'PREPARING';
      case OrderItemStatus.Ready:
        return 'READY';
      case OrderItemStatus.Served:
        return 'SERVED';
      case OrderItemStatus.Cancelled:
        return 'CANCELLED';
      default:
        return 'UNKNOWN';
    }
  }

  getItemStatusClass(status: number): string {
    switch (status) {
      case OrderItemStatus.Placed:
        return 'placed';
      case OrderItemStatus.Preparing:
        return 'preparing';
      case OrderItemStatus.Ready:
        return 'ready';
      case OrderItemStatus.Served:
        return 'served';
      case OrderItemStatus.Cancelled:
        return 'cancelled';
      default:
        return 'placed';
    }
  }

  canCancelItem(item: AdminTableOrderItem): boolean {
    return item.status === OrderItemStatus.Placed;
  }

  canReduceQuantity(item: AdminTableOrderItem): boolean {
    return item.status === OrderItemStatus.Placed && item.quantity > 1;
  }

  onCancelOrder(): void {
    this.cancelOrder.emit(this.order().orderId);
  }

  onCancelItem(orderItemId: number): void {
    this.cancelItem.emit({
      orderId: this.order().orderId,
      orderItemId,
    });
  }

  onReduceQuantity(item: AdminTableOrderItem): void {
    this.reduceQuantity.emit({
      orderId: this.order().orderId,
      item,
    });
  }
}
