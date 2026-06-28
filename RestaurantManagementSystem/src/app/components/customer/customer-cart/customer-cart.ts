import { Component, computed, inject, signal } from '@angular/core';
import { MenuService } from '../../../services/menu-service';
import { NotificationServices } from '../../../services/notification-services';
import { CartItem } from '../../../models/customer.models';
import { MatIconModule } from '@angular/material/icon';

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
    this.menuService.updateCartItem(item.id, item.quantity + 1).subscribe({
      error: (err) => {
        this.notification.error(err.error?.Message);
      }
    });
  }

  decreaseQuantity(item: CartItem): void {
    if (item.quantity === 1) {
      this.menuService.removeCartItem(item.id).subscribe({
        error: (err) => {
          this.notification.error(err.error?.Message);
        }
      });
      return;
    }
    this.menuService.updateCartItem(item.id, item.quantity - 1).subscribe({
      error: (err) => {
        this.notification.error(err.error?.Message);
      }
    });
  }

  removeItem(item: CartItem): void {
    this.menuService.removeCartItem(item.id).subscribe({
      error: (err) => {
        this.notification.error(err.error?.Message);
      }
    });
  }

  placeOrder(): void {
    this.menuService.placeOrder(this.specialInstructions()).subscribe({
      next: () => {
        this.specialInstructions.set('');
      },
      error: (err) => {
        try {
          const parsed = typeof err.error === 'string' ? JSON.parse(err.error) : err.error;
          this.notification.error(parsed?.Message ?? parsed?.message ?? 'Failed to place order');
        } catch {
          this.notification.error('Failed to place order');
        }
      }
    });
  }
}
