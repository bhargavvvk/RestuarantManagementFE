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

  stopConnection(): Promise<void> {
    return this.hubConnection?.stop() ?? Promise.resolve();
  }

  private on<T>(event: string, callback: (data: T) => void): void {
    this.hubConnection?.off(event);
    this.hubConnection?.on(event, callback);
  }

  onSessionClosed(callback: (message: string) => void): void {
    this.on('SessionClosed', callback);
  }

  onCartUpdated(callback: () => void): void {
    this.on('CartUpdated', callback);
  }

  onOrderPlaced(callback: (data: { tableNumber: string; orderNumber: string; message: string }) => void): void {
    this.on('OrderPlaced', callback);
  }

  onOrderModified(callback: (data: { tableNumber: string; orderNumber: string; message: string }) => void): void {
    this.on('OrderModified', callback);
  }

  onOrderCancelled(callback: (data: { tableNumber: string; orderNumber: string; message: string }) => void): void {
    this.on('OrderCancelled', callback);
  }

  onOrderItemStatusReady(callback: (data: { orderNumber: string; tableNumber: string; itemName: string }) => void): void {
    this.on('OrderItemStatusReady', callback);
  }

  onOrderStatusPreparing(callback: () => void): void {
    this.on('OrderStatusPreparing', callback);
  }

  onBillStatusChanged(callback: () => void): void {
    this.on('BillStatusChanged', callback);
  }

  onReceiveOrderPlaced(callback: (data: { tableNumber: string; orderNumber: string; message: string }) => void): void {
    this.on('ReceiveOrderPlaced', callback);
  }

  onItemMarkedServed(callback: (message: string) => void): void {
    this.on('ItemServed', callback);
  }

  onTableAssigned(callback: (message: string) => void): void {
    this.on('tableassinged', callback);
  }

  onTableRemoved(callback: (message: string) => void): void {
    this.on('tableremoved', callback);
  }

  onSessionCreated(callback: (message: string) => void): void {
    this.on('SessionCreated', callback);
  }

  onReceiveCustomerRequest(callback: () => void): void {
    this.on('ReceiveCustomerRequest', callback);
  }

  onReceiveOrderCancelled(callback: (data: { tableNumber: string; message: string }) => void): void {
    this.on('ReceiveOrderCancelled', callback);
  }

  onMenuUpdated(callback: (message: string) => void): void {
    this.on('MenuUpdated', callback);
  }

  onTableStatusChanged(callback: (data: { tableId: number; tableNumber: string; status: string }) => void): void {
    this.on('TableStatusChanged', callback);
  }

  offTableListeners(): void {
    this.hubConnection?.off('CartUpdated');
    this.hubConnection?.off('OrderPlaced');
    this.hubConnection?.off('OrderModified');
    this.hubConnection?.off('OrderCancelled');
    this.hubConnection?.off('OrderItemStatusReady');
    this.hubConnection?.off('OrderStatusPreparing');
    this.hubConnection?.off('BillStatusChanged');
    this.hubConnection?.off('MenuUpdated');
  }

  joinSessionGroup(sessionId: number): Promise<void> {
    return this.hubConnection!.invoke('JoinSessionGroup', sessionId);
  }

  leaveSessionGroup(sessionId: number): Promise<void> {
    return this.hubConnection!.invoke('LeaveSessionGroup', sessionId);
  }
}
