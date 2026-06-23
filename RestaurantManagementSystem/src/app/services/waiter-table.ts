import { inject, Injectable, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, Subject, switchMap, tap } from 'rxjs';
import { MenuCategory, WaiterCartItem } from '../models/waiter.models';
import { baseUrl } from '../../environment';
import { MenuItem } from '../models/customer.models';

@Injectable({
  providedIn: 'root'
})
export class WaiterTableService {
  
  readonly cart = signal<WaiterCartItem[]>([]);
  readonly selectedCategoryId =signal<number | null>(null);
  readonly vegOnly =signal(false);
  readonly search =signal('');
  readonly searchTrigger =new Subject<void>();
  private readonly http = inject(HttpClient);

  getCart(tableId: number): Observable<WaiterCartItem[]> {
    return this.http.get<WaiterCartItem[]>(
      `${baseUrl}/waiter/tables/${tableId}/cart`
    );
  }

  getCategories(): Observable<MenuCategory[]> {
    return this.http.get<MenuCategory[]>(
      `${baseUrl}/menu/categories`
    );
  }

  getMenu(
    search?: string,
    categoryId?: number,
    isAvailable?: boolean,
    foodType?: string
  ): Observable<MenuItem[]> {

    let params = new HttpParams();

    if (search) {
      params = params.set('search', search);
    }

    if (categoryId) {
      params = params.set('categoryId', categoryId);
    }

    if (isAvailable !== undefined) {
      params = params.set('isAvailable', isAvailable);
    }

    if (foodType) {
      params = params.set('foodType', foodType);
    }

    return this.http.get<MenuItem[]>(
      `${baseUrl}/menu`,
      { params }
    );
  }
  addToCart(
  tableId: number,
  menuItemId: number
  ) {
    return this.http.post(
      `${baseUrl}/waiter/tables/${tableId}/cart/items`,
      { menuItemId }
    ).pipe(
      switchMap(() =>
        this.loadCart(tableId)
      )
    );

  }
  updateCartItem(
    tableId: number,
    cartItemId: number,
    quantity: number
  ) {

    return this.http.put(
      `${baseUrl}/waiter/tables/${tableId}/cart/items/${cartItemId}`,
      { quantity }
    ).pipe(
      switchMap(() =>
        this.loadCart(tableId)
      )
    );
  }
  removeCartItem(
  tableId: number,
  cartItemId: number
  ) {

    return this.http.delete(
      `${baseUrl}/waiter/tables/${tableId}/cart/items/${cartItemId}`
    ).pipe(
      switchMap(() =>
        this.loadCart(tableId)
      )
    );

  }
  getCartItem(menuItemId: number) {

    return this.cart()
      .find(item =>
        item.menuItemId === menuItemId
      );

  }
  loadCart(tableId: number) {
    return this.getCart(tableId).pipe(
      tap(cart => {
        this.cart.set(cart);
      })
    );

  }
    getMenuItems(
    search?: string,
    categoryId?: number,
    foodType?: number
  ) {

    return this.getMenu(
      search,
      categoryId,
      undefined,
      foodType === 0 ? 'Veg' : undefined
    );
  }
}