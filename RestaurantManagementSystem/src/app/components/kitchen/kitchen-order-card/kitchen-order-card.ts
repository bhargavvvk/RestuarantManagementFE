import { Component, input, output } from '@angular/core';
import { DatePipe } from '@angular/common';
import { KitchenOrder } from '../../../models/kitchen.models';

@Component({
  selector: 'app-kitchen-order-card',
  imports: [DatePipe],
  templateUrl: './kitchen-order-card.html',
  styleUrl: './kitchen-order-card.css'
})
export class KitchenOrderCard {

  order = input.required<KitchenOrder>();

  startPreparing = output<number>();

}