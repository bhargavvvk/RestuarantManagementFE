import { Component, computed, effect, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TaxConfiguration, UpdateTaxRequest } from '../../../models/admin-tax.models';

@Component({
  selector: 'app-admin-tax-edit-modal',
  imports: [FormsModule],
  templateUrl: './admin-tax-edit-modal.html',
  styleUrl: './admin-tax-edit-modal.css',
})
export class AdminTaxEditModal {
  readonly isOpen = input.required<boolean>();
  readonly currentConfig = input.required<TaxConfiguration>();

  readonly closed = output<void>();
  readonly saved = output<UpdateTaxRequest>();

  readonly cgst = signal<number | null>(null);
  readonly sgst = signal<number | null>(null);
  readonly serviceCharge = signal<number | null>(null);
  readonly submitted = signal(false);

  readonly isFormValid = computed(() => {
    const cgst = this.cgst();
    const sgst = this.sgst();
    const sc = this.serviceCharge();
    return (
      cgst !== null && cgst >= 0 &&
      sgst !== null && sgst >= 0 &&
      sc !== null && sc >= 0
    );
  });

  readonly cgstError = computed(() => {
    if (!this.submitted()) return '';
    const v = this.cgst();
    if (v === null || isNaN(v as number)) return 'CGST is required.';
    if (v < 0) return 'CGST cannot be negative.';
    return '';
  });

  readonly sgstError = computed(() => {
    if (!this.submitted()) return '';
    const v = this.sgst();
    if (v === null || isNaN(v as number)) return 'SGST is required.';
    if (v < 0) return 'SGST cannot be negative.';
    return '';
  });

  readonly serviceChargeError = computed(() => {
    if (!this.submitted()) return '';
    const v = this.serviceCharge();
    if (v === null || isNaN(v as number)) return 'Service charge is required.';
    if (v < 0) return 'Service charge cannot be negative.';
    return '';
  });

  constructor() {
    effect(() => {
      if (this.isOpen()) {
        const cfg = this.currentConfig();
        this.cgst.set(cfg.cgstPercentage);
        this.sgst.set(cfg.sgstPercentage);
        this.serviceCharge.set(cfg.serviceChargePercentage);
        this.submitted.set(false);
      }
    });
  }

  onCgstChange(event: Event): void {
    const v = parseFloat((event.target as HTMLInputElement).value);
    this.cgst.set(isNaN(v) ? null : v);
  }

  onSgstChange(event: Event): void {
    const v = parseFloat((event.target as HTMLInputElement).value);
    this.sgst.set(isNaN(v) ? null : v);
  }

  onServiceChargeChange(event: Event): void {
    const v = parseFloat((event.target as HTMLInputElement).value);
    this.serviceCharge.set(isNaN(v) ? null : v);
  }

  close(): void {
    this.closed.emit();
  }

  save(): void {
    this.submitted.set(true);
    if (!this.isFormValid()) return;

    this.saved.emit({
      cgstPercentage: this.cgst()!,
      sgstPercentage: this.sgst()!,
      serviceChargePercentage: this.serviceCharge()!,
    });
  }
}
