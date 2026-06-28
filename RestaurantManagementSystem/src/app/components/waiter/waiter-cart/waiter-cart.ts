import { Component, computed, inject, signal } from '@angular/core';
import { WaiterTableService } from '../../../services/waiter-table';
import { NotificationServices } from '../../../services/notification-services';
import { ActivatedRoute } from '@angular/router';
import { WaiterCartItem } from '../../../models/waiter.models';
import { MatIcon } from "@angular/material/icon";

@Component({
  selector: 'app-waiter-cart',
  imports: [MatIcon],
  templateUrl: './waiter-cart.html',
  styleUrl: './waiter-cart.css',
})
export class WaiterCart {
   private menuService = inject(WaiterTableService);
  private notification = inject(NotificationServices);
  private readonly route =inject(ActivatedRoute);
  readonly tableId=Number(this.route.snapshot.paramMap.get('tableId'))
  specialInstructions = signal('');
  cartItems = this.menuService.cart;
  cartTotal = computed(() =>
    this.cartItems().reduce(
      (total, item) => total + item.price * item.quantity,
      0
    )
  );

  increaseQuantity(item: WaiterCartItem): void {
    this.menuService.updateCartItem(this.tableId,item.id, item.quantity + 1).subscribe({
      error: (err) => {
        this.notification.error(err.error?.Message);
      }
    });
  }

  decreaseQuantity(item: WaiterCartItem): void {
    if (item.quantity === 1) {
      this.menuService.removeCartItem(this.tableId,item.id).subscribe({
        error: (err) => {
          this.notification.error(err.error?.Message);
        }
      });
      return;
    }
    this.menuService.updateCartItem(this.tableId,item.id, item.quantity - 1).subscribe({
      error: (err) => {
        this.notification.error(err.error?.Message);
      }
    });
  }

  removeItem(item: WaiterCartItem): void {
    this.menuService.removeCartItem(this.tableId,item.id).subscribe({
      error: (err) => {
        this.notification.error(err.error?.Message);
      }
    });
  }

  placeOrder(): void {
    this.menuService.placeOrder(this.tableId, this.specialInstructions()).subscribe({
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
