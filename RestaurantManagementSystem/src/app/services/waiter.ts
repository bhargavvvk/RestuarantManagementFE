import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { baseUrl } from '../../environment';
import { WaiterRequest, WaiterTable } from '../models/waiter.models';


@Injectable({
  providedIn: 'root'
})
export class Waiter {

  private readonly http = inject(HttpClient);
  readonly tables = signal<WaiterTable[]>([]);
  readonly isLoaded = signal(false);
  readonly requests = signal<WaiterRequest[]>([]);
  readonly requestsLoaded = signal(false);
  private readonly baseUrl = `${baseUrl}/waiter`;

  getTables(): Observable<WaiterTable[]> {
    return this.http.get<WaiterTable[]>(`${this.baseUrl}/tables`);
  }
  getRequests(): Observable<WaiterRequest[]> {
    return this.http.get<WaiterRequest[]>(
      `${this.baseUrl}/requests`
    );
  }
  completeRequest(
    requestId: number
  ): Observable<void> {

    return this.http.patch<void>(
      `${this.baseUrl}/requests/${requestId}/complete`,
      {}
    );
  }
  removeRequest(requestId: number): void {

    this.requests.update(requests =>
      requests.filter(
        request => request.requestId !== requestId
      )
    );

  }
  loadTables(): Observable<WaiterTable[]> {
    return this.getTables().pipe(
      tap(tables => {
        this.tables.set(tables);
        this.isLoaded.set(true);
      })
    );
  }
  loadRequests(): Observable<WaiterRequest[]> {
    return this.getRequests().pipe(
      tap(requests => {
        this.requests.set(requests);
        this.requestsLoaded.set(true);
      })
    );
  }
clear(): void {

  this.tables.set([]);
  this.requests.set([]);

  this.isLoaded.set(false);
  this.requestsLoaded.set(false);

}
}