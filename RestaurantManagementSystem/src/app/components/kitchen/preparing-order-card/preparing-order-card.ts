import { Component, input, output } from '@angular/core';
import { DatePipe, NgClass } from '@angular/common';
import { KitchenOrder } from '../../../models/kitchen.models';

@Component({
  selector: 'app-preparing-order-card',
  imports: [DatePipe, NgClass],
  templateUrl: './preparing-order-card.html',
  styleUrl: './preparing-order-card.css'
})
export class PreparingOrderCard {

  order = input.required<KitchenOrder>();
  itemReady = output<{ orderId: number; itemId: number }>();

  getStatusLabel(status: number): string {
    switch (status) {
      case 0: return 'Queued';
      case 1: return 'Preparing';
      case 2: return 'Ready';
      case 3: return 'Served';
      default: return `Unknown (${status})`;
    }
  }

  getStatusClass(status: number): string {
    switch (status) {
      case 0: return 'status-queued';
      case 1: return 'status-preparing';
      case 2: return 'status-ready';
      case 3: return 'status-served';
      default: return '';
    }
  }
}