import { Injectable, signal } from '@angular/core';
import { CartItem, Category, MenuItem } from '../models/customer.models';
import { baseUrl } from '../../environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class MenuService {
  constructor(private http: HttpClient) {}
  search = signal('');
  searchTrigger = new Subject<void>();
  selectedCategoryId=signal<number | null>(null);
  vegOnly = signal(false);
  cartItems = signal<CartItem[]>([]);
  getCategories() {
     return this.http.get<Category[]>(`${baseUrl}/Menu/categories`);
  }
  getMenuItems(search?: string,categoryId?: number,foodType?: number)
  {
    let params = new HttpParams();
    if (search) {
      params = params.set('search', search);
    }
    if (categoryId) {
      params = params.set(
        'categoryId',
        categoryId
      );
    }
    if (foodType !== undefined) {
      params = params.set(
        'foodType',
        foodType
      );
    }
    return this.http.get<MenuItem[]>(
      `${baseUrl}/Menu`,{ params }
    );
  }
  getCart() {
    return this.http.get<CartItem[]>(
      `${baseUrl}/cart`
    );
  }
  addToCart(menuItemId: number) {
    return this.http.post(
      `${baseUrl}/cart/items`,
      {
        menuItemId
      }
    );

  }
  updateCartItem(cartItemId: number,quantity: number) 
  {

    return this.http.patch(
      `${baseUrl}/cart/items/${cartItemId}`,
      {
        quantity
      }
    );

  }
    removeCartItem(cartItemId: number) 
    {
    return this.http.delete(
      `${baseUrl}/cart/items/${cartItemId}`
    );
  }
  getCartItem(menuItemId: number) {
    return this.cartItems()
      .find(item => item.menuItemId === menuItemId);
  }
    loadCart(): void {
    this.getCart().subscribe({
      next: cartItems => {
        this.cartItems.set(cartItems);
      }
    });
  }
  placeOrder(specialInstructions: string) {
    return this.http.post(
      `${baseUrl}/CustomerOrder`,
      {
        specialInstructions
      }
    );
  }
}
