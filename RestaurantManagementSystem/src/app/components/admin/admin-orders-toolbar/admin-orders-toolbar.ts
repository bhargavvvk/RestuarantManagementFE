import { Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-admin-orders-toolbar',
  imports: [FormsModule],
  templateUrl: './admin-orders-toolbar.html',
  styleUrl: './admin-orders-toolbar.css',
})
export class AdminOrdersToolbar {
  readonly searchQuery = input.required<string>();

  readonly searchChanged = output<string>();
  readonly searchCleared = output<void>();

  onSearchInput(value: string): void {
    this.searchChanged.emit(value);
  }

  clearSearch(): void {
    this.searchCleared.emit();
  }
}
