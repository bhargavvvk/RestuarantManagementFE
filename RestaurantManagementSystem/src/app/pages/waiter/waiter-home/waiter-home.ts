import { Component, NgZone, OnInit, inject, signal } from '@angular/core';
import { Waiter } from '../../../services/waiter';
import { SignalRService } from '../../../services/signal-rservice';
import { NotificationServices } from '../../../services/notification-services';
import { TableCard } from '../../../components/waiter/table-card/table-card';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { RequestCard } from "../../../components/waiter/request-card/request-card";
import { Auth } from '../../../services/auth';

@Component({
  selector: 'app-waiter-home',
  imports: [TableCard, RequestCard],
  templateUrl: './waiter-home.html',
  styleUrl: './waiter-home.css'
})
export class WaiterHome implements OnInit {
    constructor() {

    this.route.queryParams.subscribe((params: Params) => {

      if (params['tab'] === 'requests') {
        this.selectedTab.set('requests');
      }

    });

  }
  private readonly waiter = inject(Waiter);
  private readonly signalR = inject(SignalRService);
  private readonly notification = inject(NotificationServices);
  private readonly zone = inject(NgZone);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly auth = inject(Auth);
  readonly tables = this.waiter.tables;
  readonly requests = this.waiter.requests;
  readonly selectedTab = signal<'tables' | 'requests'>('tables');

  ngOnInit(): void {
    this.loadTables();
     this.loadRequests();
    this.signalR.startConnection()
      .then(() => this.registerSignalREvents())
      .catch(() => this.notification.error('SignalR connection failed'));
  }

  private loadTables(): void {

    if (this.waiter.isLoaded()) {
      return;
    }

    this.waiter.loadTables().subscribe({
      error: error => {
        this.notification.error(
          error.error?.message ?? 'Failed to load tables'
        );
      }
    });

  }
  private loadRequests(): void {

    if (this.waiter.requestsLoaded()) {
      return;
    }

    this.waiter.loadRequests().subscribe({
      error: error => {
        this.notification.error(
          error.error?.message ?? 'Failed to load requests'
        );
      }
    });

  }
  private registerSignalREvents(): void {

    this.signalR.onTableAssigned(message => {
      this.zone.run(() => {
        this.notification.success(message);
        this.waiter.loadTables().subscribe();
      });
    });

    this.signalR.onTableRemoved(message => {
      this.zone.run(() => {
        this.notification.success(message);
        this.waiter.loadTables().subscribe();
      });
    });

    this.signalR.onSessionCreated(message => {
      this.zone.run(() => {
        this.notification.success(message);
        this.waiter.loadTables().subscribe();
      });
    });
    this.signalR.onReceiveCustomerRequest(() => {

      this.notification.success(
        'New Request Received'
      );

      this.waiter.loadRequests()
        .subscribe();

    });

    this.signalR.onOrderItemStatusReady(data => {
      this.zone.run(() => {
        this.notification.success(
          `Table ${data.tableNumber} | Order #${data.orderNumber} — ${data.itemName} is ready`
        );
      });
    });
  }

  setTab(tab: 'tables' | 'requests'): void {
    this.selectedTab.set(tab);
  }

  logout(): void {
    this.auth.logout();
  }
    openTable(tableId: number): void {

    const table = this.tables()
      .find(t => t.tableId === tableId);

    if (!table) {
      return;
    }

    const status = table.status.toLowerCase();

    if (
      status === 'available' ||
      status === 'unavailable'
    ) {
      return;
    }

    this.router.navigate([
      '/waiter/tables',
      tableId
    ]);

  }
    completeRequest(requestId: number): void {

    this.waiter.completeRequest(requestId)
      .subscribe({
        next: () => {

          this.waiter.removeRequest(
            requestId
          );

        },
        error: error => {

          this.notification.error(
            error.error?.message ??
            'Failed to complete request'
          );

        }
      });

  }
}