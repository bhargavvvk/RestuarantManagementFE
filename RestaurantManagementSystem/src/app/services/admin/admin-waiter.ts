import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { Observable } from 'rxjs';
import {
  AdminWaiter,
  AdminWaitersDashboard,
  CreateWaiterRequest,
  WaiterFilter,
} from '../../models/admin-waiter.models';
import { NotificationServices } from '../notification-services';
import { baseUrl } from '../../../environment';

@Injectable({
  providedIn: 'root',
})
export class AdminWaiterService {
  private readonly http = inject(HttpClient);
  private readonly notification = inject(NotificationServices);

  readonly dashboard = signal<AdminWaitersDashboard | null>(null);
  readonly loading = signal(false);
  readonly selectedFilter = signal<WaiterFilter>(WaiterFilter.All);
  readonly searchQuery = signal('');

  readonly filteredWaiters = computed(() => {
    const dashboard = this.dashboard();
    if (!dashboard) return [];

    const filter = this.selectedFilter();
    const query = this.searchQuery().toLowerCase().trim();

    let waiters = dashboard.waiters;

    if (filter === WaiterFilter.Active) {
      waiters = waiters.filter(w => w.isActive);
    } else if (filter === WaiterFilter.Inactive) {
      waiters = waiters.filter(w => !w.isActive);
    }

    if (query) {
      waiters = waiters.filter(
        w =>
          w.name.toLowerCase().includes(query) ||
          w.waiterId.toString().includes(query)
      );
    }

    return waiters;
  });

  loadDashboard(): void {
    this.loading.set(true);
    this.http
      .get<AdminWaitersDashboard>(`${baseUrl}/AdminWaiter/waiters`)
      .subscribe({
        next: response => {
          this.dashboard.set(response);
          this.loading.set(false);
        },
        error: err => {
          this.notification.error(
            err.error?.message ?? 'Unable to load waiters.'
          );
          this.loading.set(false);
        },
      });
  }

  toggleStatus(waiterId: number, isActive: boolean): void {
    this.http
      .patch(`${baseUrl}/adminwaiter/waiters/${waiterId}/status`, { isActive })
      .subscribe({
        next: () => {
          this.notification.success('Waiter status updated successfully.');
          this.loadDashboard();
        },
        error: err => {
          this.notification.error(
            err.error?.Message ?? 'Unable to update waiter status.'
          );
        },
      });
  }

  deleteWaiter(waiterId: number): void {
    this.http
      .delete(`${baseUrl}/adminwaiter/waiters/${waiterId}`)
      .subscribe({
        next: () => {
          this.notification.success('Waiter deleted successfully.');
          this.loadDashboard();
        },
        error: err => {
          this.notification.error(
            err.error?.Message ?? 'Unable to delete waiter.'
          );
        },
      });
  }

  createWaiter(request: CreateWaiterRequest): Observable<AdminWaiter> {
    return this.http.post<AdminWaiter>(
      `${baseUrl}/adminwaiter/waiters`,
      request
    );
  }
}
