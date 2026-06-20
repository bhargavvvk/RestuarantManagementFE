import { Component, computed, inject, signal } from '@angular/core';
import { MenuService } from '../../../services/menu-service';
import { CartItem } from '../../../models/customer.models';
import { MatIconModule } from '@angular/material/icon';
import { NotificationServices } from '../../../services/notification-services';

@Component({
  selector: 'app-customer-cart',
  imports: [MatIconModule],
  templateUrl: './customer-cart.html',
  styleUrl: './customer-cart.css',
})
export class CustomerCart {
  private menuService = inject(MenuService);
  private notification = inject(NotificationServices);
  specialInstructions = signal('');
  cartItems = this.menuService.cartItems;
  cartTotal = computed(() =>
    this.cartItems().reduce(
      (total, item) => total + item.price * item.quantity,
      0
    )
  );

  increaseQuantity(item: CartItem): void {
    this.menuService.updateCartItem(item.id, item.quantity + 1).subscribe();
  }

  decreaseQuantity(item: CartItem): void {
    if (item.quantity === 1) {
      this.menuService.removeCartItem(item.id).subscribe();
      return;
    }
    this.menuService.updateCartItem(item.id, item.quantity - 1).subscribe();
  }

  removeItem(item: CartItem): void {
    this.menuService.removeCartItem(item.id).subscribe();
  }

  placeOrder(): void {
    this.menuService.placeOrder(this.specialInstructions()).subscribe({
      next: () => {
        this.specialInstructions.set('');
      }
    });
  }
}
