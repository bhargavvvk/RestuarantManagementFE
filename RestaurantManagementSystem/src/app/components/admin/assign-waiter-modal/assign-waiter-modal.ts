import { Component, computed, effect, input, output, signal } from '@angular/core';
import {
  AdminTable,
  AssignWaiterRequest,
  WaiterLookup,
} from '../../../models/admin-table.models';

@Component({
  selector: 'app-assign-waiter-modal',
  imports: [],
  templateUrl: './assign-waiter-modal.html',
  styleUrl: './assign-waiter-modal.css',
})
export class AssignWaiterModal {
  readonly isOpen = input.required<boolean>();
  readonly waiters = input.required<WaiterLookup[]>();
  readonly tables = input.required<AdminTable[]>();

  readonly closed = output<void>();
  readonly assignRequested = output<AssignWaiterRequest>();

  readonly selectedTableId = signal<number | null>(null);
  readonly selectedWaiterId = signal<number | null>(null);

  readonly selectedTable = computed(() => {
    const tableId = this.selectedTableId();
    if (tableId === null) {
      return null;
    }

    return this.tables().find(table => table.id === tableId) ?? null;
  });

  readonly currentWaiterName = computed(() => {
    const assignedWaiterId = this.selectedTable()?.assignedWaiterId;
    if (!assignedWaiterId) {
      return null;
    }

    const waiter = this.waiters().find(
      candidate => candidate.waiterId === assignedWaiterId
    );

    return waiter?.name ?? 'Unknown waiter';
  });

  constructor() {
    effect(() => {
      if (this.isOpen()) {
        this.reset();
      }
    });
  }

  close(): void {
    this.closed.emit();
  }

  onTableSelected(event: Event): void {
    const tableId = Number((event.target as HTMLSelectElement).value);

    if (!tableId) {
      this.selectedTableId.set(null);
      this.selectedWaiterId.set(null);
      return;
    }

    this.selectedTableId.set(tableId);

    const table = this.tables().find(candidate => candidate.id === tableId);
    this.selectedWaiterId.set(table?.assignedWaiterId ?? null);
  }

  onWaiterSelected(event: Event): void {
    const waiterId = Number((event.target as HTMLSelectElement).value);
    this.selectedWaiterId.set(waiterId || null);
  }

  save(): void {
    const tableId = this.selectedTableId();
    const waiterId = this.selectedWaiterId();

    if (tableId === null || waiterId === null) {
      return;
    }

    this.assignRequested.emit({ tableId, waiterId });
  }

  private reset(): void {
    this.selectedTableId.set(null);
    this.selectedWaiterId.set(null);
  }
}
