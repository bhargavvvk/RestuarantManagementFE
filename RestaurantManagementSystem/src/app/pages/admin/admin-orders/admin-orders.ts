import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { AdminOrdersSummary } from '../../../components/admin/admin-orders-summary/admin-orders-summary';
import { AdminOrdersToolbar } from '../../../components/admin/admin-orders-toolbar/admin-orders-toolbar';
import { AdminOrdersTable } from '../../../components/admin/admin-orders-table/admin-orders-table';
import { AdminOrderDetailDrawer } from '../../../components/admin/admin-order-detail-drawer/admin-order-detail-drawer';
import { AdminOrdersService } from '../../../services/admin/admin-orders';

@Component({
  selector: 'app-admin-orders',
  imports: [
    AdminOrdersSummary,
    AdminOrdersToolbar,
    AdminOrdersTable,
    AdminOrderDetailDrawer,
  ],
  templateUrl: './admin-orders.html',
  styleUrl: './admin-orders.css',
})
export class AdminOrders implements OnInit {
  private readonly adminOrdersService = inject(AdminOrdersService);
  private searchDebounceTimer: ReturnType<typeof setTimeout> | null = null;

  readonly orders = this.adminOrdersService.orders;
  readonly totalCount = this.adminOrdersService.totalCount;
  readonly selectedDate = this.adminOrdersService.selectedDate;
  readonly searchQuery = this.adminOrdersService.searchQuery;
  readonly searchInput = signal('');
  readonly loading = this.adminOrdersService.loading;
  readonly paginationLabel = this.adminOrdersService.paginationLabel;
  readonly hasPreviousPage = this.adminOrdersService.hasPreviousPage;
  readonly hasNextPage = this.adminOrdersService.hasNextPage;
  readonly orderDetail = this.adminOrdersService.orderDetail;
  readonly detailLoading = this.adminOrdersService.detailLoading;
  readonly selectedOrderId = this.adminOrdersService.selectedOrderId;
  readonly drawerOpen = this.adminOrdersService.drawerOpen;

  readonly isSearching = computed(() => this.searchQuery().trim().length > 0);

  ngOnInit(): void {
    this.adminOrdersService.loadOrders();
  }

  onDateChanged(date: string): void {
    this.adminOrdersService.setDate(date);
  }

  onSearchChanged(query: string): void {
    this.searchInput.set(query);

    if (this.searchDebounceTimer) {
      clearTimeout(this.searchDebounceTimer);
    }

    this.searchDebounceTimer = setTimeout(() => {
      this.adminOrdersService.setSearch(query.trim());
    }, 1000);
  }

  onSearchCleared(): void {
    if (this.searchDebounceTimer) {
      clearTimeout(this.searchDebounceTimer);
    }

    this.searchInput.set('');
    this.adminOrdersService.clearSearch();
  }

  onViewDetails(orderId: number): void {
    this.adminOrdersService.openOrderDetail(orderId);
  }

  onCloseDrawer(): void {
    this.adminOrdersService.closeDrawer();
  }

  onPreviousPage(): void {
    this.adminOrdersService.goToPreviousPage();
  }

  onNextPage(): void {
    this.adminOrdersService.goToNextPage();
  }
}
