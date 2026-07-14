import { Component, input, output } from '@angular/core';
import { AdminMenuItem, FoodType } from '../../../models/admin-menu.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-menu-card',
  imports: [CommonModule],
  templateUrl: './admin-menu-card.html',
  styleUrl: './admin-menu-card.css',
})
export class AdminMenuCard {
  readonly menuItem = input.required<AdminMenuItem>();

  readonly edit = output<number>();
  readonly delete = output<number>();
  readonly availabilityChanged = output<AdminMenuItem>();

  onEdit(): void {
    this.edit.emit(this.menuItem().id);
  }

  onDelete(): void {
    this.delete.emit(this.menuItem().id);
  }

  onAvailabilityChange(event: Event): void {
    const checkbox = event.target as HTMLInputElement;
    const checked = checkbox.checked;

    // Revert immediately so cancel doesn't leave the checkbox in the wrong state
    checkbox.checked = !checked;

    const action = checked ? 'mark as available' : 'mark as unavailable';
    if (!confirm(`Are you sure you want to ${action} this item?`)) {
      return;
    }

    checkbox.checked = checked;
    this.availabilityChanged.emit({
      ...this.menuItem(),
      isAvailable: checked
    });
  }

  getFoodTypeLabel(): string {
    return this.menuItem().foodType === FoodType.Veg ? 'Veg' : 'Non Veg';
  }

  getFoodTypeClass(): string {
    return this.menuItem().foodType === FoodType.Veg
      ? 'food-type-veg'
      : 'food-type-nonveg';
  }
}
