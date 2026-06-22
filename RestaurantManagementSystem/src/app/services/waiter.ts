import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { baseUrl } from '../../environment';
import { WaiterTable } from '../models/waiter.models';


@Injectable({
  providedIn: 'root'
})
export class Waiter {

  private readonly http = inject(HttpClient);

  readonly tables = signal<WaiterTable[]>([]);
  readonly isLoaded = signal(false);

  private readonly baseUrl = `${baseUrl}/waiter`;

  getTables(): Observable<WaiterTable[]> {
    return this.http.get<WaiterTable[]>(`${this.baseUrl}/tables`);
  }

  loadTables(): Observable<WaiterTable[]> {
    return this.getTables().pipe(
      tap(tables => {
        this.tables.set(tables);
        this.isLoaded.set(true);
      })
    );
  }

  refreshTables(): Observable<WaiterTable[]> {
    return this.getTables().pipe(
      tap(tables => {
        this.tables.set(tables);
      })
    );
  }

  clear(): void {
    this.tables.set([]);
    this.isLoaded.set(false);
  }
}