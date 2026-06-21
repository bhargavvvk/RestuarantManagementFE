import { Component, signal } from '@angular/core';
import { KitchenHeader } from '../../../components/kitchen/kitchen-header/kitchen-header';
import {
  KitchenOrderCard,
  KitchenOrderItem
} from '../../../components/kitchen/kitchen-order-card/kitchen-order-card';
import { KitchenOrder } from '../../../models/kitchen.models';

type KitchenTab =
  | 'queue'
  | 'preparing'
  | 'ready';

@Component({
  selector: 'app-kitchen-home',
  imports: [
    KitchenHeader,
    KitchenOrderCard
  ],
  templateUrl: './kitchen-home.html',
  styleUrl: './kitchen-home.css'
})
export class KitchenHome {

  selectedTab = signal<KitchenTab>('queue');
  queueOrders = signal<KitchenOrder[]>([
    {
      tableNumber: 5,
      orderNumber: 101,
      placedAt: '12:30 PM',
      items: [
        {
          name: 'Paneer Tikka',
          quantity: 2
        }
      ]
    }
  ]);
}