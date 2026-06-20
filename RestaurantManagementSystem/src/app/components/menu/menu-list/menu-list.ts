import { Component, effect, inject, signal, untracked } from '@angular/core';
import { MenuCard } from "../menu-card/menu-card";
import { MenuService } from '../../../services/menu-service';
import { MenuItem } from '../../../models/customer.models';
import {
  Subject,
  debounceTime,
  switchMap
} from 'rxjs';

@Component({
  selector: 'app-menu-list',
  imports: [MenuCard],
  templateUrl: './menu-list.html',
  styleUrl: './menu-list.css',
})
export class MenuList {
  private menuService = inject(MenuService);
  menuItems = signal<MenuItem[]>([]);
  constructor() {

  effect(() => {

    const categoryId =
      this.menuService.selectedCategoryId();

    const vegOnly =
      this.menuService.vegOnly();
      this.loadMenuItemsWithoutSearch()
  });

}
  ngOnInit() {
    this.menuService.searchTrigger.pipe(
      debounceTime(1000),

      switchMap(() => {

        const search =
          this.menuService.search().trim();

        return this.menuService.getMenuItems(
          search || undefined,
          search.length > 0
            ? undefined
            : this.menuService.selectedCategoryId() ?? undefined,
          this.menuService.vegOnly()
            ? 0
            : undefined
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
     this.menuService.loadCart();
  }
  loadMenuItemsWithoutSearch() {

    this.menuService.getMenuItems(
      undefined,
      this.menuService.selectedCategoryId() ?? undefined,
      this.menuService.vegOnly()
        ? 0
        : undefined
    ).subscribe({
      next: items => {
        this.menuItems.set(items);
      }
    });
  }
  getQuantity(menuItemId: number): number {
    return this.menuService
      .getCartItem(menuItemId)
      ?.quantity ?? 0;
  }
  addToCart(menuItemId: number) {

    this.menuService
      .addToCart(menuItemId)
      .subscribe({

        next: () => {

          this.menuService.loadCart();

        },

        error: err => {
          console.error(err);
        }

      });

  }
  increaseQuantity(menuItemId: number) 
  {

    const cartItem =this.getCartItem(menuItemId);
    if (!cartItem) {
      return;
    }
    this.menuService .updateCartItem(cartItem.id,cartItem.quantity + 1)
      .subscribe({
        next: () => {
          this.menuService.loadCart();
        },
        error: err => {
          console.error(err);
        }
      });
  }
  decreaseQuantity(menuItemId: number) 
  {
    const cartItem =this.getCartItem(menuItemId);
    if (!cartItem) {
      return;
    }
    if (cartItem.quantity === 1) {
      this.menuService.removeCartItem(cartItem.id).subscribe({
          next: () => {
            this.menuService.loadCart();
          },
          error: err => {
            console.error(err);
          }
        });
      return;
    }
    this.menuService.updateCartItem(cartItem.id,cartItem.quantity - 1)
              .subscribe({
                next: () => {
                  this.menuService.loadCart();
                },
                error: err => {
                  console.error(err);
                }
              });

  }
  getCartItem(menuItemId: number) {
    return this.menuService.getCartItem(menuItemId);
  }
}