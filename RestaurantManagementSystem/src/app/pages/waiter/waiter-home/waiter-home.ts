import { Component, NgZone, OnInit, inject, signal } from '@angular/core';
import { Waiter } from '../../../services/waiter';
import { SignalRService } from '../../../services/signal-rservice';
import { NotificationServices } from '../../../services/notification-services';
import { TableCard } from '../../../components/waiter/table-card/table-card';

@Component({
  selector: 'app-waiter-home',
  imports: [TableCard],
  templateUrl: './waiter-home.html',
  styleUrl: './waiter-home.css'
})
export class WaiterHome implements OnInit {

  private readonly waiter = inject(Waiter);
  private readonly signalR = inject(SignalRService);
  private readonly notification = inject(NotificationServices);
  private readonly zone = inject(NgZone);

  readonly tables = this.waiter.tables;

  readonly selectedTab = signal<'tables' | 'requests'>('tables');

  ngOnInit(): void {
    this.loadTables();
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

  private registerSignalREvents(): void {

    this.signalR.onTableAssigned(message => {
      this.zone.run(() => {
        this.notification.success(message);
        this.waiter.refreshTables().subscribe();
      });
    });

    this.signalR.onTableRemoved(message => {
      this.zone.run(() => {
        this.notification.success(message);
        this.waiter.refreshTables().subscribe();
      });
    });

    this.signalR.onSessionCreated(message => {
      this.zone.run(() => {
        this.notification.success(message);
        this.waiter.refreshTables().subscribe();
      });
    });
    this.signalR.onSessionCreated(message=>{
      this.zone.run(()=>{
        this.notification.success(message);
        this.waiter.refreshTables().subscribe();
      })
    })
  }

  setTab(tab: 'tables' | 'requests'): void {
    this.selectedTab.set(tab);
  }

}