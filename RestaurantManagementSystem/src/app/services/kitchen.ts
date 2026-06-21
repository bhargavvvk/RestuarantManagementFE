import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { baseUrl } from '../../environment';
import {
  KitchenDashboardResponse,
  KitchenOrder
} from '../models/kitchen.models';

@Injectable({
  providedIn: 'root'
})
export class Kitchen {

  private readonly http = inject(HttpClient);

  readonly todayOrderCount = signal(0);

  readonly queueCount = signal(0);

  readonly preparingCount = signal(0);

  readonly readyCount = signal(0);

  readonly queueOrders = signal<KitchenOrder[]>([]);

  readonly preparingOrders = signal<KitchenOrder[]>([]);

  readonly readyOrders = signal<KitchenOrder[]>([]);

  getTodayOrderCount(): Observable<number> {

    return this.http.get<number>(
      `${baseUrl}/Kitchen/today-order-count`
    );

  }

  getOrdersByStatus(
    status: number
  ): Observable<KitchenDashboardResponse> {

    return this.http.get<KitchenDashboardResponse>(
      `${baseUrl}/Kitchen?status=${status}`
    );
  }
  startPreparing(orderId: number): Observable<void> {

  return this.http.patch<void>(
    `${baseUrl}/kitchen/orders/${orderId}/start-preparing`,
      {}
    );
  }
  markItemReady(
  orderId: number,
  itemId: number
): Observable<void> {

  return this.http.patch<void>(
    `${baseUrl}/kitchen/orders/${orderId}/items/${itemId}/ready`,
    {}
  );

}
  loadTodayOrderCount(): void {
    this.getTodayOrderCount()
      .subscribe({
        next: count => {
          this.todayOrderCount.set(count);
        },
        error: error => {
          console.error(error);
        }
      });
  }
  loadQueueOrders(): void {
    this.getOrdersByStatus(0)
      .subscribe({

        next: response => {

          this.queueCount.set(response.queueCount);

          this.preparingCount.set(response.preparingCount);

          this.readyCount.set(response.readyCount);

          this.queueOrders.set(response.orders);

        },

        error: error => {
          console.error(error);
        }

      });
  }
  loadPreparingOrders(): void {
    this.getOrdersByStatus(1)
      .subscribe({

        next: response => {

          this.queueCount.set(response.queueCount);

          this.preparingCount.set(response.preparingCount);

          this.readyCount.set(response.readyCount);

          this.preparingOrders.set(response.orders);

        },

        error: error => {
          console.error(error);
        }

      });
  }
  loadReadyOrders(): void {
    this.getOrdersByStatus(2)
      .subscribe({

        next: response => {

          this.queueCount.set(response.queueCount);

          this.preparingCount.set(response.preparingCount);

          this.readyCount.set(response.readyCount);

          this.readyOrders.set(response.orders);

        },

        error: error => {
          console.error(error);
        }

      });

  }
}