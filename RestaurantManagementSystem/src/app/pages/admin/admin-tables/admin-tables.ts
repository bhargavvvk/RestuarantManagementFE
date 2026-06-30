import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AdminTableCard } from '../../../components/admin/admin-table-card/admin-table-card';
import { AddTableModal } from '../../../components/admin/admin-table-modal/admin-table-modal';
import { AssignWaiterModal } from '../../../components/admin/assign-waiter-modal/assign-waiter-modal';
import { AdminTable } from '../../../services/admin/admin-table';
import { NotificationServices } from '../../../services/notification-services';
import { SignalRService } from '../../../services/signal-rservice';
import {
  AssignWaiterRequest,
  CreateTableRequest,
  TableFilter,
  TableStatus,
} from '../../../models/admin-table.models';

@Component({
  selector: 'app-admin-tables',
  imports: [CommonModule, AdminTableCard, AddTableModal, AssignWaiterModal],
  templateUrl: './admin-tables.html',
  styleUrl: './admin-tables.css',
})
export class AdminTables implements OnInit, OnDestroy {
  private readonly notification = inject(NotificationServices);
  private readonly adminTablesService = inject(AdminTable);
  private readonly signalR = inject(SignalRService);
  private readonly router = inject(Router);

  readonly dashboard = this.adminTablesService.dashboard;
  readonly TableFilter = TableFilter;
  readonly filteredTables = this.adminTablesService.filteredTables;
  readonly selectedFilter = this.adminTablesService.selectedFilter;
  readonly waiters = this.adminTablesService.waiters;
  readonly showAddTableModal = signal(false);
  readonly showAssignWaiterModal = signal(false);
  readonly filterDropdownOpen = signal(false);

  readonly filterLabels: Record<TableFilter, string> = {
    [TableFilter.All]: 'All Tables',
    [TableFilter.Available]: 'Available',
    [TableFilter.Occupied]: 'Occupied',
    [TableFilter.Unavailable]: 'Unavailable',
  };

  get selectedFilterLabel(): string {
    return this.filterLabels[this.selectedFilter()];
  }

  toggleFilterDropdown(): void {
    this.filterDropdownOpen.update(v => !v);
  }

  closeFilterDropdown(): void {
    this.filterDropdownOpen.set(false);
  }

  ngOnInit(): void {
    this.adminTablesService.loadDashboard();

    this.signalR.startConnection().then(() => {
      this.signalR.onSessionCreated(() => {
        this.adminTablesService.loadDashboard();
      });
    });
  }

  ngOnDestroy(): void {
    this.signalR.stopConnection();
  }

  toggleAvailability(tableId: number, status: TableStatus): void {
    this.adminTablesService.toggleAvailability(tableId, status);
  }

  deleteTable(tableId: number): void {
    this.adminTablesService.deleteTable(tableId);
  }

  openTableDetail(tableId: number): void {
    this.router.navigate(['/admin/tables', tableId]);
  }

  setFilter(filter: TableFilter): void {
    this.adminTablesService.selectedFilter.set(filter);
    this.closeFilterDropdown();
  }

  openAddTable(): void {
    this.adminTablesService.loadActiveWaiters();
    this.showAddTableModal.set(true);
  }

  closeAddTable(): void {
    this.showAddTableModal.set(false);
  }

  openAssignWaiter(): void {
    this.adminTablesService.loadActiveWaiters();
    this.showAssignWaiterModal.set(true);
  }

  closeAssignWaiter(): void {
    this.showAssignWaiterModal.set(false);
  }

  assignWaiter(request: AssignWaiterRequest): void {
    this.adminTablesService
      .assignWaiter(request.tableId, request.waiterId)
      .subscribe({
        next: response => {
          this.notification.success(
            `Waiter assigned to ${response.tableNumber} successfully.`
          );
          this.closeAssignWaiter();
          this.adminTablesService.loadDashboard();
        },
        error: err => {
          this.notification.error(
            err.error?.Message ?? 'Unable to assign waiter.'
          );
        },
      });
  }

  createTable(request: CreateTableRequest): void {
    this.adminTablesService.createTable(request).subscribe({
      next: () => {
        this.notification.success('Table created successfully.');
        this.closeAddTable();
        this.adminTablesService.loadDashboard();
      },
      error: err => {
        this.notification.error(
          err.error?.Message ?? 'Unable to create table.'
        );
      },
    });
  }
}
