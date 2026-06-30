import { Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-admin-bills-toolbar',
  imports: [FormsModule],
  templateUrl: './admin-bills-toolbar.html',
  styleUrl: './admin-bills-toolbar.css',
})
export class AdminBillsToolbar {
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
