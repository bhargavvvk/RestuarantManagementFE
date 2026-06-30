import { Component, ElementRef, input, output, ViewChild } from '@angular/core';
import { formatDisplayDate, formatShortDisplayDate } from '../../../utils/date.utils';

@Component({
  selector: 'app-admin-orders-summary',
  imports: [],
  templateUrl: './admin-orders-summary.html',
  styleUrl: './admin-orders-summary.css',
})
export class AdminOrdersSummary {
  readonly totalCount = input.required<number>();
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
