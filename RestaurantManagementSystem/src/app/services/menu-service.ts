import { Injectable, signal } from '@angular/core';
import { CartItem, Category, CustomerBill, CustomerOrder, MenuItem, SplitBillResponse } from '../models/customer.models';
import { baseUrl } from '../../environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { forkJoin, Subject } from 'rxjs';

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
  orders = signal<CustomerOrder[]>([]);
  bill = signal<CustomerBill | null>(null);
  ordersLoading = signal(false);
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
      { specialInstructions },
      { responseType: 'text' }
    );
  }
  getOrders() {
    return this.http.get<CustomerOrder[]>(
      `${baseUrl}/CustomerOrder`
    );
  }

  getBillSummary() {
    return this.http.get<CustomerBill>(
      `${baseUrl}/Bill/Customer`
    );
  }
  getSplitBill() {
    return this.http.get<SplitBillResponse>(
      `${baseUrl}/Bill/Customer/split`
    );
  }
  saveSplitBill(customSplitsJson: string) {
    return this.http.put(`${baseUrl}/Bill/Customer/split`, { customSplitsJson });
  }
  loadOrderData() {

    this.ordersLoading.set(true);
    forkJoin({
      orders: this.getOrders(),
      bill: this.getBillSummary()
    }).subscribe({
      next: result => {

        this.orders.set(result.orders);
        this.bill.set(result.bill);

        this.ordersLoading.set(false);
      },
      error: () => {

        this.ordersLoading.set(false);

      }
    });

  }
  loadOrders() {
    this.getOrders()
      .subscribe(orders => {
        this.orders.set(orders);
      });
  }

  loadBill() {
    this.getBillSummary()
      .subscribe(bill => {
        this.bill.set(bill);
      });
  }
}
