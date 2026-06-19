import { Component, inject, Input, signal } from '@angular/core';
import { Customer } from '../../../services/customer';
import { CustomerSession } from '../../../services/customer-session';
import { ActivatedRoute, Router } from '@angular/router';
import { SignalRService } from '../../../services/signal-rservice';
import { Header } from '../../../components/customer/header/header';
import { CustomerRequest } from "../../../components/customer/customer-request/customer-request";
import { CustomerBottomNav } from "../../../components/customer/customer-bottom-nav/customer-bottom-nav";
import { MenuFilter } from "../../../components/menu/menu-filter/menu-filter";
import { MenuList } from "../../../components/menu/menu-list/menu-list";
import { CustomerCart } from "../../../components/customer/customer-cart/customer-cart";
import { CustomerOrders } from "../../../components/customer/customer-orders/customer-orders";

@Component({
  selector: 'app-customer-operations',
  imports: [Header, CustomerRequest, CustomerBottomNav, MenuFilter, MenuList, CustomerCart, CustomerOrders],
  templateUrl: './customer-operations.html',
  styleUrl: './customer-operations.css',
})
export class CustomerOperations {
  tableNumber = signal<string>("");
  sessionOtp = '';
  private signalR = inject(SignalRService);
  private route=inject(ActivatedRoute);
  private customerService=inject(Customer);
   private customerSession=inject(CustomerSession);
   private router=inject(Router);
  tableIdentifier = '';
  activeTab = signal<'menu' | 'cart' | 'orders'>('menu');
  ngOnInit(): void {
    this.tableIdentifier =
    this.route.snapshot.paramMap.get('tableIdentifier') ?? '';
    this.sessionOtp = this.customerSession.getSessionOtp() ?? '';
    this.loadTableInfo();
    this.validateSession();
    this.signalR.startConnection()
    .then(() => console.log('SignalR Connected'))
    .catch(err => console.error(err));
    this.signalR.onSessionClosed(() => {
      this.customerSession.clearSession();
      this.router.navigate(['/join',this.tableIdentifier]);
  });
  }
  private loadTableInfo(): void {
    this.customerService
      .getTable(this.tableIdentifier)
      .subscribe({
        next: response => {
          this.tableNumber.set(response.tableNumber)
          console.log('Table Response:', response);
        },
        error: error => {
          console.error(error);
        }
      });
  }
  validateSession(): void {
  this.customerService
    .validateSession()
    .subscribe({
      next: (response) => {
       if (
        !response.isActive ||
        response.tableIdentifier !== this.tableIdentifier
      ) {
        this.router.navigate([
          '/join',
          this.tableIdentifier
        ]);
        return;
      }
      console.log('Session Valid', response);
    },
      error: () => {
        this.customerSession.clearSession();
        this.router.navigate(['/join', this.tableIdentifier]);
      }
    });
}
  changeTab(tab: 'menu' | 'cart' | 'orders') {
    this.activeTab.set(tab);
      console.log(tab);
  }
}
