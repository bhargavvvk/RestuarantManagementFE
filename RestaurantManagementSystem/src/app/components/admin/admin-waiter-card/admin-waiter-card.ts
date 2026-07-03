import { Component, input, output, signal } from '@angular/core';
import { AdminWaiter } from '../../../models/admin-waiter.models';
import { DecimalPipe } from '@angular/common';

type DialogType = 'toggle' | 'delete' | null;

@Component({
  selector: 'app-admin-waiter-card',
  imports: [DecimalPipe],
  templateUrl: './admin-waiter-card.html',
  styleUrl: './admin-waiter-card.css',
})
export class AdminWaiterCard {
  readonly waiter = input.required<AdminWaiter>();

  readonly statusToggled = output<{ waiterId: number; isActive: boolean }>();
  readonly deleteClicked = output<number>();

  readonly dialogVisible = signal(false);
  readonly dialogType = signal<DialogType>(null);

  private pendingIsActive: boolean | null = null;
  private pendingCheckbox: HTMLInputElement | null = null;

  onStatusToggled(event: Event): void {
    const checkbox = event.target as HTMLInputElement;
    if (this.waiter().assignedTableCount > 0) {
      // shouldn't fire due to [disabled], but guard anyway
      checkbox.checked = !checkbox.checked;
      return;
    }
    this.pendingCheckbox = checkbox;
    this.pendingIsActive = checkbox.checked;
    this.dialogType.set('toggle');
    this.dialogVisible.set(true);
  }

  onDelete(): void {
    if (this.waiter().assignedTableCount > 0) return;
    this.dialogType.set('delete');
    this.dialogVisible.set(true);
  }

  confirmDialog(): void {
    if (this.dialogType() === 'toggle' && this.pendingIsActive !== null) {
      this.statusToggled.emit({
        waiterId: this.waiter().waiterId,
        isActive: this.pendingIsActive,
      });
    } else if (this.dialogType() === 'delete') {
      this.deleteClicked.emit(this.waiter().waiterId);
    }
    this.closeDialog();
  }

  closeDialog(): void {
    if (this.dialogType() === 'toggle' && this.pendingCheckbox) {
      this.pendingCheckbox.checked = !this.pendingCheckbox.checked;
    }
    this.dialogVisible.set(false);
    this.dialogType.set(null);
    this.pendingIsActive = null;
    this.pendingCheckbox = null;
  }

  get dialogTitle(): string {
    return this.dialogType() === 'delete' ? 'Delete Waiter' : 'Change Status';
  }

  get dialogMessage(): string {
    const name = this.waiter().name;
    if (this.dialogType() === 'delete') {
      return `Are you sure you want to delete ${name}? This action cannot be undone.`;
    }
    const next = this.pendingIsActive ? 'Active' : 'Inactive';
    return `Are you sure you want to mark ${name} as ${next}?`;
  }

  get isDestructive(): boolean {
    return this.dialogType() === 'delete';
  }
}
