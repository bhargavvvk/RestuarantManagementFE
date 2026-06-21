import {
  Component,
  computed,
  inject,
  NgZone,
  OnDestroy,
  OnInit,
  signal
} from '@angular/core';

import { KitchenHeader } from '../../../components/kitchen/kitchen-header/kitchen-header';
import { KitchenOrderCard } from '../../../components/kitchen/kitchen-order-card/kitchen-order-card';
import { PreparingOrderCard } from '../../../components/kitchen/preparing-order-card/preparing-order-card';
import { ReadyOrderCard } from '../../../components/kitchen/ready-order-card/ready-order-card';
import { Kitchen } from '../../../services/kitchen';
import { NotificationServices } from '../../../services/notification-services';
import { SignalRService } from '../../../services/signal-rservice';

type KitchenTab =
  | 'queue'
  | 'preparing'
  | 'ready';

@Component({
  selector: 'app-kitchen-home',
  imports: [
    KitchenHeader,
    KitchenOrderCard,
    PreparingOrderCard,
    ReadyOrderCard
  ],
  templateUrl: './kitchen-home.html',
  styleUrl: './kitchen-home.css'
})
export class KitchenHome implements OnInit, OnDestroy {

  private readonly kitchenService = inject(Kitchen);
  private readonly notification = inject(NotificationServices);
  private readonly signalRService = inject(SignalRService);
  private readonly zone = inject(NgZone);
  readonly todayOrderCount =
    this.kitchenService.todayOrderCount;

  readonly queueOrders =
    this.kitchenService.queueOrders;

  readonly preparingOrders =
    this.kitchenService.preparingOrders;

  readonly readyOrders =
    this.kitchenService.readyOrders;

  readonly queueCount =
    this.kitchenService.queueCount;

  readonly preparingCount =
    this.kitchenService.preparingCount;

  readonly readyCount =
    this.kitchenService.readyCount;

  selectedTab = signal<KitchenTab>('queue');

  summaryText = computed(() => {

    switch (this.selectedTab()) {

      case 'queue':
        return `${this.queueCount()} Orders Waiting to be Prepared`;

      case 'preparing':
        return `${this.preparingCount()} Orders Currently Being Prepared`;

      case 'ready':
        return `${this.readyCount()} Orders Ready For Pickup`;

      default:
        return '';
    }

  });

  ngOnInit(): void {

    this.kitchenService.loadTodayOrderCount();

    this.kitchenService.loadQueueOrders();

    this.kitchenService.loadPreparingOrders();

    this.kitchenService.loadReadyOrders();
    this.registerSignalRListeners();
  }
  onStartPreparing(orderId: number): void {

    this.kitchenService
      .startPreparing(orderId)
      .subscribe({

        next: () => {

          this.kitchenService.loadQueueOrders();
          this.kitchenService.loadPreparingOrders();
        },

        error: error => {

        this.notification.error(error.message)
        }

      });
  }
  onItemReady(event: {orderId: number;itemId: number;}): void {

    this.kitchenService
      .markItemReady(
        event.orderId,
        event.itemId
      )
      .subscribe({

        next: () => {

          this.kitchenService.loadPreparingOrders();

          this.kitchenService.loadReadyOrders();

        },

        error: error => {

        this.notification.error(error.message)

        }

      });
  }
  ngOnDestroy(): void {
    this.signalRService.leaveGroup('kitchen');
  }

  private registerSignalRListeners(): void {

    this.signalRService.startConnection().then(() => {

      this.signalRService.joinGroup('kitchen');

      this.signalRService.onOrderPlaced((data) => {
        this.zone.run(() => {
          this.notification.success(`Table ${data.tableNumber} | Order #${data.orderNumber} — ${data.message}`);
          this.kitchenService.loadQueueOrders();
          this.kitchenService.loadTodayOrderCount();
        });
      });

      this.signalRService.onOrderModified((data) => {
        this.zone.run(() => {
          this.notification.success(`Table ${data.tableNumber} | Order #${data.orderNumber} — ${data.message}`);
          this.kitchenService.loadQueueOrders();
          this.kitchenService.loadPreparingOrders();
        });
      });

      this.signalRService.onOrderCancelled((data) => {
        this.zone.run(() => {
          this.notification.error(`Table ${data.tableNumber} | Order #${data.orderNumber} — ${data.message}`);
          this.kitchenService.loadQueueOrders();
          this.kitchenService.loadPreparingOrders();
        });
      });

      this.signalRService.onOrderStatusPreparing(() => {
        this.zone.run(() => {
          this.kitchenService.loadQueueOrders();
          this.kitchenService.loadPreparingOrders();
        });
      });

      this.signalRService.onOrderItemStatusReady(() => {
        this.zone.run(() => {
          this.kitchenService.loadPreparingOrders();
          this.kitchenService.loadReadyOrders();
        });
      });

      this.signalRService.onItemMarkedServed((message: string) => {
        this.zone.run(() => {
          this.notification.success(message);
          this.kitchenService.loadPreparingOrders();
          this.kitchenService.loadReadyOrders();
        });
      });

    }).catch(err => {

      this.notification.error('SignalR connection failed: ' + err.message);

    });

  }
}