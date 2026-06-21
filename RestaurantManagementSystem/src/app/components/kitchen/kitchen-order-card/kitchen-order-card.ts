import { Component, input } from '@angular/core';

export interface KitchenOrderItem {
  name: string;
  quantity: number;
}

@Component({
  selector: 'app-kitchen-order-card',
  imports: [],
  templateUrl: './kitchen-order-card.html',
  styleUrl: './kitchen-order-card.css'
})
export class KitchenOrderCard {

  tableNumber = input.required<number>();

  orderNumber = input.required<number>();

  placedAt = input.required<string>();
  items = input.required<KitchenOrderItem[]>();
}