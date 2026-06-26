import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { hubUrl } from '../../environment';
@Injectable({
  providedIn: 'root',
})
export class SignalRService {
  private hubConnection?: signalR.HubConnection;
  startConnection(): Promise<void> {
    if (
      this.hubConnection &&
      this.hubConnection.state === signalR.HubConnectionState.Connected
    ) {
      return Promise.resolve();
    }

    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(`${hubUrl}/notificationHub`, {
        accessTokenFactory: () =>
          localStorage.getItem('token') ?? ''
      })
      .withAutomaticReconnect()
      .build();

    return this.hubConnection.start();
  }
  onSessionClosed(callback: (message: string) => void): void {
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

  onOrderItemStatusReady(callback: (data: { orderNumber: string; tableNumber: string; itemName: string }) => void): void {
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
    callback: (data: { tableNumber: string; message: string }) => void
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
  onTableAssigned(
    callback: (message: string) => void
  ): void {
    this.hubConnection?.on('tableassinged', callback);
  }

  onTableRemoved(
    callback: (message: string) => void
  ): void {
    this.hubConnection?.on('tableremoved', callback);
  }

  onSessionCreated(
    callback: (message: string) => void
  ): void {
    this.hubConnection?.on('SessionCreated', callback);
  }
  onReceiveCustomerRequest(
    callback: () => void
  ): void {

    this.hubConnection?.on(
      'ReceiveCustomerRequest',
      callback
    );

  }

  onReceiveOrderCancelled(
    callback: (data: { tableNumber: string; message: string }) => void
  ): void {
    this.hubConnection?.on('ReceiveOrderCancelled', callback);
  }

  stopConnection(): Promise<void> {
    return this.hubConnection?.stop() ?? Promise.resolve();
  }

  joinSessionGroup(sessionId: number): Promise<void> {
    return this.hubConnection!.invoke('JoinSessionGroup', sessionId);
  }

  leaveSessionGroup(sessionId: number): Promise<void> {
    return this.hubConnection!.invoke('LeaveSessionGroup', sessionId);
  }
}
