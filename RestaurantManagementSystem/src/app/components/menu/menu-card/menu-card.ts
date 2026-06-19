import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-menu-card',
  imports: [],
  templateUrl: './menu-card.html',
  styleUrl: './menu-card.css',
})
export class MenuCard {
  name = input('Paneer Butter Masala');
  description = input('Rich and creamy paneer curry');
  price = input(220);
  imageUrl = input<string | null>(null);
  foodType = input<number>(0);
  isAvailable = input(true);
  quantity = input(0);
  itemAdded = output<void>();
  quantityIncreased = output<void>();
  quantityDecreased = output<void>();
  addItem() {
    this.itemAdded.emit();
  }
  increaseQuantity() {
    this.quantityIncreased.emit();
  }

  decreaseQuantity() {
    this.quantityDecreased.emit();
  }
}
