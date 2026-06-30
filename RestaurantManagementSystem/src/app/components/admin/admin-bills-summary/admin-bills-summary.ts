import { DecimalPipe } from '@angular/common';
import { Component, ElementRef, input, output, ViewChild } from '@angular/core';
import { AdminBillsSummary as AdminBillsSummaryData } from '../../../models/admin-bill.models';
import { formatDisplayDate, formatShortDisplayDate } from '../../../utils/date.utils';

@Component({
  selector: 'app-admin-bills-summary',
  imports: [DecimalPipe],
  templateUrl: './admin-bills-summary.html',
  styleUrl: './admin-bills-summary.css',
})
export class AdminBillsSummary {
  readonly summary = input<AdminBillsSummaryData | null>(null);
  readonly summaryLoading = input(false);
  readonly selectedDate = input.required<string>();
  readonly isSearching = input(false);

  readonly dateChanged = output<string>();

  @ViewChild('dateInput') dateInputRef!: ElementRef<HTMLInputElement>;

  get today(): string {
    return new Date().toISOString().split('T')[0];
  }

  get formattedDate(): string {
    return formatDisplayDate(this.selectedDate());
  }

  get shortDateLabel(): string {
    return formatShortDisplayDate(this.selectedDate());
  }

  openPicker(): void {
    const input = this.dateInputRef?.nativeElement;
    if (!input) return;
    try {
      input.showPicker();
    } catch {
      input.click();
    }
  }

  onDateChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    if (value) {
      this.dateChanged.emit(value);
    }
  }
}
