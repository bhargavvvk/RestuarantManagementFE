import { Component, inject, OnInit, signal } from '@angular/core';
import { AdminWaiterService } from '../../../services/admin/admin-waiter';
import { AdminWaiterCard } from '../../../components/admin/admin-waiter-card/admin-waiter-card';
import { AdminWaiterSummaryCard } from '../../../components/admin/admin-waiter-summary-card/admin-waiter-summary-card';
import { AdminAddWaiterModal } from '../../../components/admin/admin-add-waiter-modal/admin-add-waiter-modal';
import { NotificationServices } from '../../../services/notification-services';
import { CreateWaiterRequest, WaiterFilter } from '../../../models/admin-waiter.models';

@Component({
  selector: 'app-admin-waiters',
  imports: [AdminWaiterCard, AdminWaiterSummaryCard, AdminAddWaiterModal],
  templateUrl: './admin-waiters.html',
  styleUrl: './admin-waiters.css',
})
export class AdminWaiters implements OnInit {
  private readonly waiterService = inject(AdminWaiterService);
  private readonly notification = inject(NotificationServices);

  readonly dashboard = this.waiterService.dashboard;
  readonly filteredWaiters = this.waiterService.filteredWaiters;
  readonly selectedFilter = this.waiterService.selectedFilter;
  readonly searchQuery = this.waiterService.searchQuery;
  readonly WaiterFilter = WaiterFilter;

  readonly showAddModal = signal(false);

  ngOnInit(): void {
    this.waiterService.loadDashboard();
  }

  setFilter(filter: WaiterFilter): void {
    this.waiterService.selectedFilter.set(filter);
  }

  clearSearch(): void {
    this.waiterService.searchQuery.set('');
  }

  onSearch(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.waiterService.searchQuery.set(value);
  }

  openAddModal(): void {
    this.showAddModal.set(true);
  }

  closeAddModal(): void {
    this.showAddModal.set(false);
  }

  createWaiter(request: CreateWaiterRequest): void {
    this.waiterService.createWaiter(request).subscribe({
      next: () => {
        this.notification.success('Waiter created successfully.');
        this.closeAddModal();
        this.waiterService.loadDashboard();
      },
      error: err => {
        this.notification.error(
          err.error?.Message ?? 'Unable to create waiter.'
        );
      },
    });
  }

  toggleStatus(waiterId: number, isActive: boolean): void {
    this.waiterService.toggleStatus(waiterId, isActive);
  }

  deleteWaiter(waiterId: number): void {
    this.waiterService.deleteWaiter(waiterId);
  }
}
