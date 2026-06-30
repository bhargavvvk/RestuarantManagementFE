import { HttpClient, HttpParams } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import {
  AdminBillDetail,
  AdminBillListItem,
  AdminBillsPage,
  AdminBillsSummary,
} from '../../models/admin-bill.models';
import { baseUrl } from '../../../environment';
import { NotificationServices } from '../notification-services';
import { toIsoDateString } from '../../utils/date.utils';

@Injectable({
  providedIn: 'root',
})
export class AdminBillsService {
  private readonly http = inject(HttpClient);
  private readonly notification = inject(NotificationServices);

  readonly bills = signal<AdminBillListItem[]>([]);
  readonly totalCount = signal(0);
  readonly pageNumber = signal(1);
  readonly pageSize = signal(10);
  readonly selectedDate = signal(toIsoDateString());
  readonly searchQuery = signal('');
  readonly loading = signal(false);
  readonly summary = signal<AdminBillsSummary | null>(null);
  readonly summaryLoading = signal(false);
  readonly billDetail = signal<AdminBillDetail | null>(null);
  readonly detailLoading = signal(false);
  readonly selectedBillId = signal<number | null>(null);
  readonly drawerOpen = signal(false);

  readonly paginationLabel = computed(() => {
    const total = this.totalCount();
    if (total === 0) {
      return 'Showing 0 bills';
    }

    const start = (this.pageNumber() - 1) * this.pageSize() + 1;
    const end = Math.min(this.pageNumber() * this.pageSize(), total);
    return `Showing ${start}-${end} of ${total} bills`;
  });

  readonly hasPreviousPage = computed(() => this.pageNumber() > 1);

  readonly hasNextPage = computed(() => {
    const search = this.searchQuery().trim();
    if (search) {
      return this.bills().length === this.pageSize();
    }
    return this.pageNumber() * this.pageSize() < this.totalCount();
  });

  loadBills(): void {
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
      .get<AdminBillsPage>(`${baseUrl}/Admin/bills`, { params })
      .subscribe({
        next: response => {
          this.bills.set(response.items);
          this.pageNumber.set(response.pageNumber);
          this.pageSize.set(response.pageSize);

          const activeSearch = this.searchQuery().trim();
          if (activeSearch) {
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
              'Unable to load bills.'
          );
          this.loading.set(false);
        },
      });
  }

  loadSummary(): void {
    if (this.searchQuery().trim()) {
      return;
    }

    this.summaryLoading.set(true);

    const params = new HttpParams().set('date', this.selectedDate());

    this.http
      .get<AdminBillsSummary>(`${baseUrl}/Admin/bills/summary`, { params })
      .subscribe({
        next: response => {
          this.summary.set(response);
          this.summaryLoading.set(false);
        },
        error: err => {
          this.notification.error(
            err.error?.Message ??
              err.error?.message ??
              'Unable to load bills summary.'
          );
          this.summaryLoading.set(false);
        },
      });
  }

  loadBillDetail(billId: number): void {
    this.detailLoading.set(true);
    this.selectedBillId.set(billId);

    this.http
      .get<AdminBillDetail>(`${baseUrl}/Admin/bills/${billId}`)
      .subscribe({
        next: response => {
          this.billDetail.set(response);
          this.detailLoading.set(false);
        },
        error: err => {
          this.notification.error(
            err.error?.Message ??
              err.error?.message ??
              'Unable to load bill details.'
          );
          this.detailLoading.set(false);
        },
      });
  }

  setDate(date: string): void {
    this.selectedDate.set(date);
    this.searchQuery.set('');
    this.pageNumber.set(1);
    this.loadBills();
    this.loadSummary();
  }

  setSearch(query: string): void {
    this.searchQuery.set(query);
    this.pageNumber.set(1);
    this.loadBills();
  }

  clearSearch(): void {
    if (!this.searchQuery()) {
      return;
    }

    this.searchQuery.set('');
    this.pageNumber.set(1);
    this.loadBills();
    this.loadSummary();
  }

  goToNextPage(): void {
    if (!this.hasNextPage()) {
      return;
    }

    this.pageNumber.update(page => page + 1);
    this.loadBills();
  }

  goToPreviousPage(): void {
    if (!this.hasPreviousPage()) {
      return;
    }

    this.pageNumber.update(page => page - 1);
    this.loadBills();
  }

  openBillDetail(billId: number): void {
    this.drawerOpen.set(true);
    this.loadBillDetail(billId);
  }

  closeDrawer(): void {
    this.drawerOpen.set(false);
    this.selectedBillId.set(null);
    this.billDetail.set(null);
  }
}
