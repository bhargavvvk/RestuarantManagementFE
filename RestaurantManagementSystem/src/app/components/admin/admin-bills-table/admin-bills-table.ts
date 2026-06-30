import { DecimalPipe } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { AdminBillListItem } from '../../../models/admin-bill.models';
import { formatTime12Hour } from '../../../utils/date.utils';

@Component({
  selector: 'app-admin-bills-table',
  imports: [DecimalPipe],
  templateUrl: './admin-bills-table.html',
  styleUrl: './admin-bills-table.css',
})
export class AdminBillsTable {
  readonly bills = input.required<AdminBillListItem[]>();
  readonly selectedBillId = input<number | null>(null);
  readonly loading = input(false);
  readonly paginationLabel = input('');
  readonly hasPreviousPage = input(false);
  readonly hasNextPage = input(false);

  readonly viewDetails = output<number>();
  readonly previousPage = output<void>();
  readonly nextPage = output<void>();

  formatTime(date: string): string {
    return formatTime12Hour(date);
  }

  isSelected(billId: number): boolean {
    return this.selectedBillId() === billId;
  }
}
