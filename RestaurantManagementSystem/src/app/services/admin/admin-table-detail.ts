import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Observable } from 'rxjs';
import {
  AdminTableBill,
  AdminTableDetail,
  AdminTableOrder,
} from '../../models/admin-table.models';
import { baseUrl } from '../../../environment';
import { NotificationServices } from '../notification-services';

@Injectable({
  providedIn: 'root',
})
export class AdminTableDetailService {
  private readonly http = inject(HttpClient);
  private readonly notification = inject(NotificationServices);

  readonly tableDetail = signal<AdminTableDetail | null>(null);
  readonly orders = signal<AdminTableOrder[]>([]);
  readonly bill = signal<AdminTableBill | null>(null);
  readonly loading = signal(false);

  loadTableDetail(tableId: number): void {
    this.loading.set(true);

    this.http
      .get<AdminTableDetail>(`${baseUrl}/admin/tables/${tableId}`)
      .subscribe({
        next: response => {
          this.tableDetail.set(response);
          this.loading.set(false);
        },
        error: err => {
          this.notification.error(
            err.error?.Message ?? err.error?.message ?? 'Unable to load table details.'
          );
          this.loading.set(false);
        },
      });
  }

  loadOrders(tableId: number): void {
    this.http
      .get<AdminTableOrder[]>(`${baseUrl}/admin/tables/${tableId}/orders`)
      .subscribe({
        next: response => {
          this.orders.set(response);
        },
        error: err => {
          this.notification.error(
            err.error?.Message ?? err.error?.message ?? 'Unable to load orders.'
          );
        },
      });
  }

  loadBill(tableId: number): void {
    this.http
      .get<AdminTableBill>(`${baseUrl}/admin/tables/${tableId}/bill`)
      .subscribe({
        next: response => {
          this.bill.set(response);
        },
        error: err => {
          this.notification.error(
            err.error?.Message ?? err.error?.message ?? 'Unable to load bill.'
          );
        },
      });
  }

  loadAll(tableId: number): void {
    this.loadTableDetail(tableId);
    this.loadOrders(tableId);
    this.loadBill(tableId);
  }

  toggleServiceCharge(
    tableId: number,
    includeServiceCharge: boolean
  ): Observable<AdminTableBill> {
    return this.http.patch<AdminTableBill>(
      `${baseUrl}/admin/tables/${tableId}/bill/service-charge`,
      { includeServiceCharge }
    );
  }

  cancelOrder(tableId: number, orderId: number): Observable<void> {
    return this.http.patch<void>(
      `${baseUrl}/admin/tables/${tableId}/orders/${orderId}/cancel`,
      {}
    );
  }

  cancelOrderItem(
    tableId: number,
    orderId: number,
    orderItemId: number
  ): Observable<void> {
    return this.http.patch<void>(
      `${baseUrl}/admin/tables/${tableId}/orders/${orderId}/items/${orderItemId}/cancel`,
      {}
    );
  }

  updateOrderItemQuantity(
    tableId: number,
    orderId: number,
    orderItemId: number,
    quantity: number
  ): Observable<void> {
    return this.http.patch<void>(
      `${baseUrl}/admin/tables/${tableId}/orders/${orderId}/items/${orderItemId}/quantity`,
      { quantity }
    );
  }
}
