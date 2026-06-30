import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { AdminBillsSummary } from '../../../components/admin/admin-bills-summary/admin-bills-summary';
import { AdminBillsToolbar } from '../../../components/admin/admin-bills-toolbar/admin-bills-toolbar';
import { AdminBillsTable } from '../../../components/admin/admin-bills-table/admin-bills-table';
import { AdminBillDetailDrawer } from '../../../components/admin/admin-bill-detail-drawer/admin-bill-detail-drawer';
import { AdminBillsService } from '../../../services/admin/admin-bills';

@Component({
  selector: 'app-admin-bill',
  imports: [
    AdminBillsSummary,
    AdminBillsToolbar,
    AdminBillsTable,
    AdminBillDetailDrawer,
  ],
  templateUrl: './admin-bill.html',
  styleUrl: './admin-bill.css',
})
export class AdminBill implements OnInit {
  private readonly adminBillsService = inject(AdminBillsService);
  private searchDebounceTimer: ReturnType<typeof setTimeout> | null = null;

  readonly bills = this.adminBillsService.bills;
  readonly totalCount = this.adminBillsService.totalCount;
  readonly selectedDate = this.adminBillsService.selectedDate;
  readonly searchQuery = this.adminBillsService.searchQuery;
  readonly searchInput = signal('');
  readonly loading = this.adminBillsService.loading;
  readonly summary = this.adminBillsService.summary;
  readonly summaryLoading = this.adminBillsService.summaryLoading;
  readonly paginationLabel = this.adminBillsService.paginationLabel;
  readonly hasPreviousPage = this.adminBillsService.hasPreviousPage;
  readonly hasNextPage = this.adminBillsService.hasNextPage;
  readonly billDetail = this.adminBillsService.billDetail;
  readonly detailLoading = this.adminBillsService.detailLoading;
  readonly selectedBillId = this.adminBillsService.selectedBillId;
  readonly drawerOpen = this.adminBillsService.drawerOpen;

  readonly isSearching = computed(() => this.searchQuery().trim().length > 0);

  ngOnInit(): void {
    this.adminBillsService.loadBills();
    this.adminBillsService.loadSummary();
  }

  onDateChanged(date: string): void {
    this.adminBillsService.setDate(date);
  }

  onSearchChanged(query: string): void {
    this.searchInput.set(query);

    if (this.searchDebounceTimer) {
      clearTimeout(this.searchDebounceTimer);
    }

    this.searchDebounceTimer = setTimeout(() => {
      this.adminBillsService.setSearch(query.trim());
    }, 1000);
  }

  onSearchCleared(): void {
    if (this.searchDebounceTimer) {
      clearTimeout(this.searchDebounceTimer);
    }

    this.searchInput.set('');
    this.adminBillsService.clearSearch();
  }

  onViewDetails(billId: number): void {
    this.adminBillsService.openBillDetail(billId);
  }

  onCloseDrawer(): void {
    this.adminBillsService.closeDrawer();
  }

  onPreviousPage(): void {
    this.adminBillsService.goToPreviousPage();
  }

  onNextPage(): void {
    this.adminBillsService.goToNextPage();
  }
}
