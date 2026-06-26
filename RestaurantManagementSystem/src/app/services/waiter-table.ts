import { inject, Injectable, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, single, Subject, switchMap, tap } from 'rxjs';
import { MenuCategory, PaymentMethod, ServedOrderItemResponse, WaiterBill, WaiterCartItem, WaiterOrder } from '../models/waiter.models';
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
  readonly orders = signal<WaiterOrder[]>([]);
  readonly bill=signal<WaiterBill|null>(null);
  readonly paymentMethods = signal<PaymentMethod[]>([]);
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
  placeOrder(tableId: number, specialInstructions: string) {
    return this.http.post(
      `${baseUrl}/Waiter/tables/${tableId}/orders`,
      { specialInstructions },
      { responseType: 'text' }
    );
  }
  getOrders(tableId :number) {
      return this.http.get<WaiterOrder[]>(
        `${baseUrl}/waiter/tables/${tableId}/orders`
      );
    }
  getBill(tableId: number) {
    return this.http.get<WaiterBill>(
      `${baseUrl}/Waiter/tables/${tableId}/bill`
    );
  }
  markServed(
  tableId: number,
  orderItemId: number
  ) {
    return this.http.put<ServedOrderItemResponse>(
      `${baseUrl}/Waiter/tables/${tableId}/orders/items/${orderItemId}/serve`,
      {}
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
  loadBill(tableId: number): void {

    this.getBill(tableId)
      .subscribe({
        next: bill => {
          this.bill.set(bill);
        }
      });

  }
  loadOrders(tableId: number): void {

    this.getOrders(tableId)
      .subscribe({
        next: orders => {
          this.orders.set(orders);
        }
      });

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
  updateOrderItemStatus(
  orderItemId: number,
  status: number
  ): void {

    this.orders.update(orders =>
      orders.map(order => ({
        ...order,
        items: order.items.map(item =>
          item.orderItemId === orderItemId
            ? {
                ...item,
                status
              }
            : item
        )
      }))
    );
  }
  getPaymentMethods() {
    return this.http.get<PaymentMethod[]>(
      `${baseUrl}/Bill/payment-methods`
    );
  }
  loadPaymentMethods(): void {
    this.getPaymentMethods()
      .subscribe({
        next: methods => {
          this.paymentMethods.set(methods);
        }
      });
  }
  markBillPaid(
    tableId: number,
    paymentMethod: number
  ) {

    return this.http.put<WaiterBill>(
      `${baseUrl}/Waiter/tables/${tableId}/bill/pay`,
      {
        paymentMethod
      }
    );

  }
  updateBill(
    bill: WaiterBill
  ): void {
    this.bill.set(bill);
  }
  closeSession(
    tableId: number
  ) {
    return this.http.put(
      `${baseUrl}/Waiter/tables/${tableId}/close-session`,
      {}
    );

  }
}