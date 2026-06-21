import { Component, input } from '@angular/core';
import { DatePipe, NgClass } from '@angular/common';
import { KitchenOrder } from '../../../models/kitchen.models';

@Component({
  selector: 'app-ready-order-card',
  imports: [DatePipe, NgClass],
  templateUrl: './ready-order-card.html',
  styleUrl: './ready-order-card.css'
})
export class ReadyOrderCard {

  order = input.required<KitchenOrder>();

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