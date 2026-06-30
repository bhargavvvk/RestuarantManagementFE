import { HttpClient, HttpParams } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import {
  AdminOrderDetail,
  AdminOrderListItem,
  AdminOrdersPage,
} from '../../models/admin-order.models';
import { baseUrl } from '../../../environment';
import { NotificationServices } from '../notification-services';
import { toIsoDateString } from '../../utils/date.utils';

@Injectable({
  providedIn: 'root',
})
export class AdminOrdersService {
  private readonly http = inject(HttpClient);
  private readonly notification = inject(NotificationServices);

  readonly orders = signal<AdminOrderListItem[]>([]);
  readonly totalCount = signal(0);
  readonly pageNumber = signal(1);
  readonly pageSize = signal(10);
  readonly selectedDate = signal(toIsoDateString());
  readonly searchQuery = signal('');
  readonly loading = signal(false);
  readonly orderDetail = signal<AdminOrderDetail | null>(null);
  readonly detailLoading = signal(false);
  readonly selectedOrderId = signal<number | null>(null);
  readonly drawerOpen = signal(false);

  readonly paginationLabel = computed(() => {
    const total = this.totalCount();
    if (total === 0) {
      return 'Showing 0 orders';
    }

    const start = (this.pageNumber() - 1) * this.pageSize() + 1;
    const end = Math.min(this.pageNumber() * this.pageSize(), total);
    return `Showing ${start}-${end} of ${total} orders`;
  });

  readonly hasPreviousPage = computed(() => this.pageNumber() > 1);

  readonly hasNextPage = computed(() => {
    const search = this.searchQuery().trim();
    if (search) {
      // Only show Next if we got a full page back — meaning there could be more
      return this.orders().length === this.pageSize();
    }
    return this.pageNumber() * this.pageSize() < this.totalCount();
  });

  loadOrders(): void {
    this.loading.set(true);

    let params = new HttpParams()
      .set('pageSize', this.pageSize())
      .set('pageNumber', this.pageNumber());

    const search = this.searchQuery().trim();
    if (search) {
      params = params.set('search', search);
    } else {
      params = params.set('date', this.selectedDate());
    }

    this.http
      .get<AdminOrdersPage>(`${baseUrl}/Admin/orders`, { params })
      .subscribe({
        next: response => {
          this.orders.set(response.items);
          this.pageNumber.set(response.pageNumber);
          this.pageSize.set(response.pageSize);

          // When searching, the backend returns the global totalCount, not the
          // filtered count. Derive the real total from the actual items returned.
          const search = this.searchQuery().trim();
          if (search) {
            const derivedTotal =
              (response.pageNumber - 1) * response.pageSize + response.items.length;
            this.totalCount.set(derivedTotal);
          } else {
            this.totalCount.set(response.totalCount);
          }

          this.loading.set(false);
        },
        error: err => {
          this.notification.error(
            err.error?.Message ??
              err.error?.message ??
              'Unable to load orders.'
          );
          this.loading.set(false);
        },
      });
  }

  loadOrderDetail(orderId: number): void {
    this.detailLoading.set(true);
    this.selectedOrderId.set(orderId);

    this.http
      .get<AdminOrderDetail>(`${baseUrl}/Admin/orders/${orderId}`)
      .subscribe({
        next: response => {
          this.orderDetail.set(response);
          this.detailLoading.set(false);
        },
        error: err => {
          this.notification.error(
            err.error?.Message ??
              err.error?.message ??
              'Unable to load order details.'
          );
          this.detailLoading.set(false);
        },
      });
  }

  setDate(date: string): void {
    this.selectedDate.set(date);
    this.searchQuery.set('');
    this.pageNumber.set(1);
    this.loadOrders();
  }

  setSearch(query: string): void {
    this.searchQuery.set(query);
    this.pageNumber.set(1);
    this.loadOrders();
  }

  clearSearch(): void {
    if (!this.searchQuery()) {
      return;
    }

    this.searchQuery.set('');
    this.pageNumber.set(1);
    this.loadOrders();
  }

  goToNextPage(): void {
    if (!this.hasNextPage()) {
      return;
    }

    this.pageNumber.update(page => page + 1);
    this.loadOrders();
  }

  goToPreviousPage(): void {
    if (!this.hasPreviousPage()) {
      return;
    }

    this.pageNumber.update(page => page - 1);
    this.loadOrders();
  }

  openOrderDetail(orderId: number): void {
    this.drawerOpen.set(true);
    this.loadOrderDetail(orderId);
  }

  closeDrawer(): void {
    this.drawerOpen.set(false);
    this.selectedOrderId.set(null);
    this.orderDetail.set(null);
  }
}
