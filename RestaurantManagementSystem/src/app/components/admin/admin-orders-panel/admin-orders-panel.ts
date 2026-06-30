import { Component, computed, input, output } from '@angular/core';
import { AdminOrderCard } from '../admin-order-card/admin-order-card';
import {
  AdminTableOrder,
  AdminTableOrderItem,
} from '../../../models/admin-table.models';

@Component({
  selector: 'app-admin-orders-panel',
  imports: [AdminOrderCard],
  templateUrl: './admin-orders-panel.html',
  styleUrl: './admin-orders-panel.css',
})
export class AdminOrdersPanel {
  readonly orders = input.required<AdminTableOrder[]>();

  readonly cancelOrder = output<number>();
  readonly cancelItem = output<{ orderId: number; orderItemId: number }>();
  readonly reduceQuantity = output<{ orderId: number; item: AdminTableOrderItem }>();

  readonly orderCount = computed(() => this.orders().length);
}
