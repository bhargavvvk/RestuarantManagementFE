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
  onOrderPlaced(callback: () => void): void {
    this.hubConnection?.on('OrderPlaced', callback);
  }
}
