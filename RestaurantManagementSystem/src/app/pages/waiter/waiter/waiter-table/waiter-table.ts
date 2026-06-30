import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Waiter } from '../../../../services/waiter';
import { Auth } from '../../../../services/auth';
import { WaiterMenuList } from "../../../../components/waiter/waiter-menu-list/waiter-menu-list";
import { WaiterTableService } from '../../../../services/waiter-table';
import { WaiterMenuFilter } from "../../../../components/waiter/waiter-menu-filter/waiter-menu-filter";
import { SignalRService } from '../../../../services/signal-rservice';
import { WaiterCart } from "../../../../components/waiter/waiter-cart/waiter-cart";
import { NotificationServices } from '../../../../services/notification-services';
import { WaiterOrder } from "../../../../components/waiter/waiter-order/waiter-order";
import { WaiterBill } from "../../../../components/waiter/waiter-bill/waiter-bill";

@Component({
  selector: 'app-waiter-table',
  imports: [WaiterMenuList, WaiterMenuFilter, WaiterCart, WaiterOrder, WaiterBill],
  templateUrl: './waiter-table.html',
  styleUrl: './waiter-table.css',
})
export class WaiterTable implements OnInit, OnDestroy {
  private readonly waiterTableService = inject(WaiterTableService);
  private readonly notification=inject(NotificationServices);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly waiter = inject(Waiter);
  private readonly auth = inject(Auth);
  private readonly signalR = inject(SignalRService);

  readonly tableId = Number(this.route.snapshot.paramMap.get('tableId'));
  private sessionId: number | null = null;

  ngOnInit(): void {
    if (this.waiter.isLoaded()) {
      this.initTable();
      return;
    }

    this.waiter.loadTables().subscribe({
      next: () => this.initTable(),
      error: error => {
        this.notification.error(
          error.error?.message ?? 'Failed to load tables'
        );
        this.router.navigate(['waiter']);
      }
    });
  }

  private initTable(): void {
    const table = this.validateAccess();
    if (!table) return;
    this.sessionId = table.sessionId;
    this.waiterTableService.loadCart(this.tableId).subscribe();
    this.waiterTableService.loadOrders(this.tableId);
    this.waiterTableService.loadBill(this.tableId);
    if (this.sessionId !== null) {
      const id = this.sessionId;
      this.signalR.startConnection()
        .then(() => this.signalR.joinSessionGroup(id))
        .then(() => this.registerSignalRListeners())
        .catch(() => {});
    }
  }
  private registerSignalRListeners(): void {
    this.signalR.onCartUpdated(() => {
      this.waiterTableService.loadCart(this.tableId).subscribe();
    });

    this.signalR.onOrderPlaced(() => {
      this.notification.success('New Order Placed');
      this.waiterTableService.loadCart(this.tableId).subscribe();
      this.reloadOrdersAndBill();
    });

    this.signalR.onOrderModified(data => {
      this.notification.success(data.message);
      this.reloadOrdersAndBill();
    });

    this.signalR.onOrderCancelled(data => {
      this.notification.success(`Order #${data.orderNumber}: ${data.message}`);
      this.reloadOrdersAndBill();
    });

    this.signalR.onOrderItemStatusReady((data) => {
      this.reloadOrdersAndBill();
      this.notification.success(`${data.itemName} is ready for Table ${data.tableNumber}`);
    });

    this.signalR.onOrderStatusPreparing(() => {
      this.reloadOrdersAndBill();
    });

    this.signalR.onItemMarkedServed(() => {
      this.reloadOrdersAndBill();
    });

    this.signalR.onBillStatusChanged(() => {
      this.waiterTableService.loadBill(this.tableId);
    });

    this.signalR.onMenuUpdated(() => {
      this.waiterTableService.searchTrigger.next();
    });
  }

  private reloadOrdersAndBill(): void {
    this.waiterTableService.loadOrders(this.tableId);
    this.waiterTableService.loadBill(this.tableId);
  }
  ngOnDestroy(): void {
    if (this.sessionId !== null) {
      this.signalR.leaveSessionGroup(this.sessionId).catch(() => {});
    }
    this.signalR.offTableListeners();
  }

  private validateAccess() {
    const table = this.waiter.tables().find(t => t.tableId === this.tableId);

    if (!table) {
      this.router.navigate(['waiter']);
      return null;
    }

    const status = table.status.toLowerCase();

    if (status === 'available' || status === 'unavailable') {
      this.router.navigate(['waiter']);
      return null;
    }

    return table;
  }

  readonly selectedTab = signal<'menu' | 'cart' | 'orders' | 'bill'>('menu');

  setTab(tab: 'menu' | 'cart' | 'orders' | 'bill'): void {
    this.selectedTab.set(tab);
    if (tab === 'bill') {
      this.waiterTableService.loadPaymentMethods();
    }
  }

  goBack(): void {
    this.router.navigate(['waiter']);
  }

  logout(): void {
    this.auth.logout();
  }

  goToTables(): void {
    this.router.navigate(['waiter']);
  }

  goToRequests(): void {
    this.router.navigate(['waiter'], { queryParams: { tab: 'requests' } });
  }
}
