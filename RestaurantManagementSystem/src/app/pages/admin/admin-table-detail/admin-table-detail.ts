import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AdminTableInfo } from '../../../components/admin/admin-table-info/admin-table-info';
import { AdminOrdersPanel } from '../../../components/admin/admin-orders-panel/admin-orders-panel';
import { AdminBillSummary } from '../../../components/admin/admin-bill-summary/admin-bill-summary';
import { AdminTableDetailService } from '../../../services/admin/admin-table-detail';
import { NotificationServices } from '../../../services/notification-services';
import { SignalRService } from '../../../services/signal-rservice';
import { AdminTableOrderItem } from '../../../models/admin-table.models';

@Component({
  selector: 'app-admin-table-detail',
  imports: [RouterLink, AdminTableInfo, AdminOrdersPanel, AdminBillSummary],
  templateUrl: './admin-table-detail.html',
  styleUrl: './admin-table-detail.css',
})
export class AdminTableDetail implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly notification = inject(NotificationServices);
  private readonly tableDetailService = inject(AdminTableDetailService);
  private readonly signalR = inject(SignalRService);

  readonly tableDetail = this.tableDetailService.tableDetail;
  readonly orders = this.tableDetailService.orders;
  readonly bill = this.tableDetailService.bill;
  readonly loading = this.tableDetailService.loading;

  readonly tableId = Number(this.route.snapshot.paramMap.get('tableId'));

  ngOnInit(): void {
    if (!this.tableId) {
      this.router.navigate(['/admin/tables']);
      return;
    }

    this.tableDetailService.loadAll(this.tableId);

    this.signalR.startConnection().then(() => {
      this.signalR.onOrderPlaced(() => {
        this.tableDetailService.loadOrders(this.tableId);
        this.tableDetailService.loadBill(this.tableId);
      });
    });
  }

  ngOnDestroy(): void {
    this.signalR.stopConnection();
  }

  onServiceChargeToggle(includeServiceCharge: boolean): void {
    this.tableDetailService
      .toggleServiceCharge(this.tableId, includeServiceCharge)
      .subscribe({
        next: bill => {
          this.tableDetailService.bill.set(bill);
          this.notification.success('Service charge updated.');
        },
        error: err => {
          this.notification.error(
            err.error?.Message ??
              err.error?.message ??
              'Unable to update service charge.'
          );
          this.tableDetailService.loadBill(this.tableId);
        },
      });
  }

  cancelOrder(orderId: number): void {
    this.tableDetailService.cancelOrder(this.tableId, orderId).subscribe({
      next: () => {
        this.notification.success('Order cancelled successfully.');
        this.refreshOrdersAndBill();
      },
      error: err => {
        this.notification.error(
          err.error?.Message ??
            err.error?.message ??
            'Unable to cancel order.'
        );
      },
    });
  }

  cancelOrderItem(orderId: number, orderItemId: number): void {
    this.tableDetailService
      .cancelOrderItem(this.tableId, orderId, orderItemId)
      .subscribe({
        next: () => {
          this.notification.success('Order item cancelled successfully.');
          this.refreshOrdersAndBill();
        },
        error: err => {
          this.notification.error(
            err.error?.Message ??
              err.error?.message ??
              'Unable to cancel order item.'
          );
        },
      });
  }

  reduceQuantity(orderId: number, item: AdminTableOrderItem): void {
    this.tableDetailService
      .updateOrderItemQuantity(
        this.tableId,
        orderId,
        item.orderItemId,
        item.quantity - 1
      )
      .subscribe({
        next: () => {
          this.notification.success('Quantity updated successfully.');
          this.refreshOrdersAndBill();
        },
        error: err => {
          this.notification.error(
            err.error?.Message ??
              err.error?.message ??
              'Unable to update quantity.'
          );
        },
      });
  }

  printBill(): void {
    window.print();
  }

  private refreshOrdersAndBill(): void {
    this.tableDetailService.loadOrders(this.tableId);
    this.tableDetailService.loadBill(this.tableId);
  }
}
