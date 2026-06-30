import { Component, input, output, signal } from '@angular/core';
import { AdminTable, TableStatus } from '../../../models/admin-table.models';

type DialogType = 'toggle' | 'delete' | null;

@Component({
  selector: 'app-admin-table-card',
  imports: [],
  templateUrl: './admin-table-card.html',
  styleUrl: './admin-table-card.css',
})
export class AdminTableCard {
  readonly table = input.required<AdminTable>();
  readonly availabilityChanged = output<TableStatus>();
  readonly deleteClicked = output<number>();
  readonly tableClicked = output<number>();

  // dialog state
  readonly dialogVisible = signal(false);
  readonly dialogType = signal<DialogType>(null);

  // store pending toggle value and the checkbox element to revert on cancel
  private pendingToggleStatus: TableStatus | null = null;
  private pendingCheckbox: HTMLInputElement | null = null;

  // --- toggle ---
  onAvailabilityChanged(event: Event): void {
    const checkbox = event.target as HTMLInputElement;
    this.pendingCheckbox = checkbox;
    this.pendingToggleStatus = checkbox.checked ? TableStatus.Available : TableStatus.Unavailable;
    this.dialogType.set('toggle');
    this.dialogVisible.set(true);
  }

  // --- delete ---
  onDelete(): void {
    this.dialogType.set('delete');
    this.dialogVisible.set(true);
  }

  // --- dialog actions ---
  confirmDialog(): void {
    if (this.dialogType() === 'toggle' && this.pendingToggleStatus !== null) {
      this.availabilityChanged.emit(this.pendingToggleStatus);
    } else if (this.dialogType() === 'delete') {
      this.deleteClicked.emit(this.table().id);
    }
    this.closeDialog();
  }

  closeDialog(): void {
    // revert the checkbox visually if the user cancelled a toggle
    if (this.dialogType() === 'toggle' && this.pendingCheckbox) {
      this.pendingCheckbox.checked = !this.pendingCheckbox.checked;
    }
    this.dialogVisible.set(false);
    this.dialogType.set(null);
    this.pendingToggleStatus = null;
    this.pendingCheckbox = null;
  }

  // --- helpers for dialog copy ---
  get dialogTitle(): string {
    return this.dialogType() === 'delete' ? 'Delete Table' : 'Change Availability';
  }

  get dialogMessage(): string {
    const t = this.table().tableNumber;
    if (this.dialogType() === 'delete') {
      return `Are you sure you want to delete Table ${t}? This action cannot be undone.`;
    }
    const next = this.pendingToggleStatus === TableStatus.Available ? 'Available' : 'Unavailable';
    return `Are you sure you want to mark Table ${t} as ${next}?`;
  }

  get isDestructive(): boolean {
    return this.dialogType() === 'delete';
  }

  onCardClick(): void {
    if (this.table().status === 'Occupied') {
      this.tableClicked.emit(this.table().id);
    }
  }
}
