import { Component, effect, inject, signal } from '@angular/core';
import { MenuCard } from "../menu-card/menu-card";
import { MenuService } from '../../../services/menu-service';
import { NotificationServices } from '../../../services/notification-services';
import { MenuItem } from '../../../models/customer.models';
import { MatIconModule } from '@angular/material/icon';
import { debounceTime, switchMap } from 'rxjs';

@Component({
  selector: 'app-menu-list',
  imports: [MenuCard, MatIconModule],
  templateUrl: './menu-list.html',
  styleUrl: './menu-list.css',
})
export class MenuList {
  private menuService = inject(MenuService);
  private notification = inject(NotificationServices);
  menuItems = signal<MenuItem[]>([]);

  constructor() {
    effect(() => {
      this.menuService.selectedCategoryId();
      this.menuService.vegOnly();
      this.loadMenuItemsWithoutSearch();
    });
  }

  ngOnInit() {
    this.menuService.searchTrigger.pipe(
      debounceTime(1000),
      switchMap(() => {
        const search = this.menuService.search().trim();
        return this.menuService.getMenuItems(
          search || undefined,
          search.length > 0
            ? undefined
            : this.menuService.selectedCategoryId() ?? undefined,
          this.menuService.vegOnly() ? 0 : undefined
        );
      })
    ).subscribe({
      next: items => {
        this.menuItems.set(items);
      },
      error: err => {
        console.error(err);
      }
    });
  }

  loadMenuItemsWithoutSearch() {
    this.menuService.getMenuItems(
      undefined,
      this.menuService.selectedCategoryId() ?? undefined,
      this.menuService.vegOnly() ? 0 : undefined
    ).subscribe({
      next: items => {
        this.menuItems.set(items);
      }
    });
  }

  getQuantity(menuItemId: number): number {
    return this.menuService.getCartItem(menuItemId)?.quantity ?? 0;
  }

  addToCart(menuItemId: number) {
    this.menuService.addToCart(menuItemId).subscribe({
      error: (err) => {
        this.notification.error(err.error?.Message);
      }
    });
  }

  increaseQuantity(menuItemId: number) {
    const cartItem = this.getCartItem(menuItemId);
    if (!cartItem) return;
    this.menuService.updateCartItem(cartItem.id, cartItem.quantity + 1).subscribe({
      error: (err) => {
        this.notification.error(err.error?.Message);
      }
    });
  }

  decreaseQuantity(menuItemId: number) {
    const cartItem = this.getCartItem(menuItemId);
    if (!cartItem) return;
    if (cartItem.quantity === 1) {
      this.menuService.removeCartItem(cartItem.id).subscribe({
        error: (err) => {
          this.notification.error(err.error?.Message);
        }
      });
      return;
    }
    this.menuService.updateCartItem(cartItem.id, cartItem.quantity - 1).subscribe({
      error: (err) => {
        this.notification.error(err.error?.Message);
      }
    });
  }

  getCartItem(menuItemId: number) {
    return this.menuService.getCartItem(menuItemId);
  }
}
