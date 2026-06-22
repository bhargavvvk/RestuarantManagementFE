import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { hubUrl } from '../../environment';
@Injectable({
  providedIn: 'root',
})
export class SignalRService {
  private hubConnection?: signalR.HubConnection;
  startConnection(): Promise<void> {
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(`${hubUrl}/notificationHub`, {
        accessTokenFactory: () =>
          localStorage.getItem('token') ?? ''
      })
      .withAutomaticReconnect()
      .build();

    return this.hubConnection.start();
  }
  onSessionClosed(callback: () => void): void {
    this.hubConnection?.on(
      'SessionClosed',
      callback
    );
  }
  onCartUpdated(callback:()=>void):void{
    this.hubConnection?.on('CartUpdated',callback);
  }
  onOrderPlaced(callback: (data: { tableNumber: string; orderNumber: string; message: string }) => void): void {
    this.hubConnection?.on('OrderPlaced', callback);
  }
  onOrderModified(callback: (data: { tableNumber: string; orderNumber: string; message: string }) => void): void {
    this.hubConnection?.on('OrderModified', callback);
  }

  onOrderCancelled(callback: (data: { tableNumber: string; orderNumber: string; message: string }) => void): void {
    this.hubConnection?.on('OrderCancelled', callback);
  }

  onOrderItemStatusReady(callback: () => void): void {
    this.hubConnection?.on(
      'OrderItemStatusReady',
      callback
    );
  }

  onOrderStatusPreparing(callback: () => void): void {
    this.hubConnection?.on(
      'OrderStatusPreparing',
      callback
    );
  }
  onBillStatusChanged(callback:()=>void):void{
    this.hubConnection?.on('BillStatusChanged', callback);
  }
  onReceiveOrderPlaced(
    callback: (data: any) => void
  ): void {

    this.hubConnection?.on(
      'ReceiveOrderPlaced',
      callback
    );

  }
  onItemMarkedServed(
    callback: (data: any) => void
  ): void {

    this.hubConnection?.on(
      'ItemServed',
      callback
    );

  }
}
