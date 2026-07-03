import { Component, computed, effect, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CreateWaiterRequest } from '../../../models/admin-waiter.models';

@Component({
  selector: 'app-admin-add-waiter-modal',
  imports: [FormsModule],
  templateUrl: './admin-add-waiter-modal.html',
  styleUrl: './admin-add-waiter-modal.css',
})
export class AdminAddWaiterModal {
  readonly isOpen = input.required<boolean>();

  readonly closed = output<void>();
  readonly waiterCreated = output<CreateWaiterRequest>();

  readonly name = signal('');
  readonly username = signal('');
  readonly mobileNumber = signal('');
  readonly submitted = signal(false);

  readonly isFormValid = computed(() => {
    const name = this.name().trim();
    const username = this.username().trim();
    const mobile = this.mobileNumber().trim();
    return (
      name.length > 0 && name.length <= 15 &&
      username.length > 0 && username.length <= 15 &&
      mobile.length > 0
    );
  });

  readonly nameError = computed(() => {
    const v = this.name().trim();
    if (!this.submitted() && v.length <= 15) return '';
    if (v.length === 0) return 'Name is required.';
    if (v.length > 15) return 'Name must be 15 characters or less.';
    return '';
  });

  readonly usernameError = computed(() => {
    const v = this.username().trim();
    if (!this.submitted() && v.length <= 15) return '';
    if (v.length === 0) return 'Username is required.';
    if (v.length > 15) return 'Username must be 15 characters or less.';
    return '';
  });

  readonly mobileError = computed(() => {
    if (!this.submitted()) return '';
    if (this.mobileNumber().trim().length === 0) return 'Mobile number is required.';
    return '';
  });

  constructor() {
    effect(() => {
      if (this.isOpen()) {
        this.reset();
      }
    });
  }

  private reset(): void {
    this.name.set('');
    this.username.set('');
    this.mobileNumber.set('');
    this.submitted.set(false);
  }

  close(): void {
    this.closed.emit();
  }

  create(): void {
    this.submitted.set(true);
    if (!this.isFormValid()) return;

    this.waiterCreated.emit({
      name: this.name().trim(),
      username: this.username().trim(),
      mobileNumber: this.mobileNumber().trim(),
    });
  }
}
