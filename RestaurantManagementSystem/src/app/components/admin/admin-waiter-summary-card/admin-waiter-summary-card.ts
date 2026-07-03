import { Component, input } from '@angular/core';

@Component({
  selector: 'app-admin-waiter-summary-card',
  imports: [],
  templateUrl: './admin-waiter-summary-card.html',
  styleUrl: './admin-waiter-summary-card.css',
})
export class AdminWaiterSummaryCard {
  readonly label = input.required<string>();
  readonly count = input.required<number>();
  readonly icon = input.required<string>();
  readonly variant = input<'default' | 'active' | 'inactive'>('default');
}
