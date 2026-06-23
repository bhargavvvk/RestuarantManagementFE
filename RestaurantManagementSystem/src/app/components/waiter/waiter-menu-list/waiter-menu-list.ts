import { Component, effect, inject, signal } from '@angular/core';
import { MenuCard } from "../../menu/menu-card/menu-card";
import { WaiterTableService } from '../../../services/waiter-table';
import { NotificationServices } from '../../../services/notification-services';
import { MenuItem } from '../../../models/waiter.models';
import { debounceTime, switchMap } from 'rxjs';
import { MatIcon } from "@angular/material/icon";
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-waiter-menu-list',
  imports: [MenuCard, MatIcon],
  templateUrl: './waiter-menu-list.html',
  styleUrl: './waiter-menu-list.css',
})
export class WaiterMenuList {
  private readonly route =inject(ActivatedRoute);
  private menuService = inject(WaiterTableService);
  private notification = inject(NotificationServices);
  readonly tableId=Number(this.route.snapshot.paramMap.get('tableId'))
  menuItems = signal<MenuItem[]>([]);
  constructor() {
    effect(() => {
       const categoryId=this.menuService.selectedCategoryId();
      this.menuService.vegOnly();
      if (categoryId === null) return;
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
    this.menuService.addToCart(this.tableId,menuItemId).subscribe({
      error: (err) => {
        this.notification.error(err.error?.Message);
      }
    });
  }

  increaseQuantity(menuItemId: number) {
    const cartItem = this.getCartItem(menuItemId);
    if (!cartItem) return;
    this.menuService.updateCartItem(this.tableId,cartItem.id, cartItem.quantity + 1).subscribe({
      error: (err) => {
        this.notification.error(err.error?.Message);
      }
    });
  }

  decreaseQuantity(menuItemId: number) {
    const cartItem = this.getCartItem(menuItemId);
    if (!cartItem) return;
    if (cartItem.quantity === 1) {
      this.menuService.removeCartItem(this.tableId,cartItem.id).subscribe({
        error: (err) => {
          this.notification.error(err.error?.Message);
        }
      });
      return;
    }
    this.menuService.updateCartItem(this.tableId,cartItem.id, cartItem.quantity - 1).subscribe({
      error: (err) => {
        this.notification.error(err.error?.Message);
      }
    });
  }

  getCartItem(menuItemId: number) {
    return this.menuService.getCartItem(menuItemId);
  }
}
