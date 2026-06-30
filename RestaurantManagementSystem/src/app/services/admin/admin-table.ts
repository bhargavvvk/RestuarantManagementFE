import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { AdminTablesDashboard, AssignWaiterResponse, CreateTableRequest, CreateTableResponse, TableFilter, TableStatus, WaiterLookup, WaitersResponse } from '../../models/admin-table.models';
import { baseUrl } from '../../../environment';
import { NotificationServices } from '../notification-services';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AdminTable {
  private readonly http = inject(HttpClient);
  private readonly notification=inject(NotificationServices)
  readonly dashboard = signal<AdminTablesDashboard | null>(null);
  readonly loading = signal(false);
  readonly selectedFilter = signal<TableFilter>(TableFilter.All);
  readonly waiters = signal<WaiterLookup[]>([]);
  loadDashboard(): void {
      this.loading.set(true);
      this.http
          .get<AdminTablesDashboard>(
              `${baseUrl}/admin/tables/dashboard`
          )
          .subscribe({
              next: response => {
                  this.dashboard.set(response);
                  this.loading.set(false);
              },
             error: err => {
               this.notification.error(err.error?.message ?? 'Something went wrong');
                this.loading.set(false);
            }
          });
  }
  toggleAvailability(
    tableId: number,
    status: TableStatus
): void {

    this.http.patch(
        `${baseUrl}/admin/tables/${tableId}/availability`,
        { status }
    ).subscribe({

        next: () => {

            this.notification.success(
                'Table availability updated.'
            );

            this.loadDashboard();

        },

        error: err => {

            this.notification.error(
                err.error?.message ?? 'Unable to update table availability.'
            );

        }

    });

}
 deleteTable(tableId: number): void {

    this.http.delete(
        `${baseUrl}/admin/tables/${tableId}`
    ).subscribe({

        next: () => {

            this.notification.success(
                'Table deleted successfully.'
            );

            this.loadDashboard();

        },

        error: err => {

            this.notification.error(
                err.error?.message ?? 'Unable to delete table.'
            );

        }

    });

    }
 loadActiveWaiters(): void {

        this.http
            .get<WaitersResponse>(
                `${baseUrl}/AdminWaiter/waiters?isActive=true`
            )
            .subscribe({
                next: response => {
                    this.waiters.set(response.waiters);
                },
                error: err => {
                    this.notification.error(
                        err.error?.Message ??
                        'Unable to load waiters.'
                    );
                }
            });
    }
  createTable(
    request: CreateTableRequest
    ): Observable<CreateTableResponse> {

        return this.http.post<CreateTableResponse>(
            `${baseUrl}/admin/tables`,
            request
        );

    }
  assignWaiter(
    tableId: number,
    waiterId: number
  ): Observable<AssignWaiterResponse> {
    return this.http.patch<AssignWaiterResponse>(
      `${baseUrl}/admin/tables/${tableId}/assign-waiter`,
      { waiterId }
    );
  }
  readonly filteredTables = computed(() => {

    const dashboard = this.dashboard();

    if (!dashboard) {
        return [];
    }

    const filter = this.selectedFilter();

    if (filter === TableFilter.All) {
        return dashboard.tables;
    }

    return dashboard.tables.filter(
        table => table.status === filter
    );

});
}
