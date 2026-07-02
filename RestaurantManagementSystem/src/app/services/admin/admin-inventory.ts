import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { baseUrl } from '../../../environment';
import {
  CreateInventoryItemRequest,
  InventoryResponse,
  InventorySearchParams,
  UpdateInventoryQuantityRequest,
  UpdateInventoryThresholdRequest,
} from '../../models/admin-inventory.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AdminInventory {
  private readonly http = inject(HttpClient);


  getInventory(params: InventorySearchParams): Observable<InventoryResponse> {
    let httpParams = new HttpParams()
      .set('lowStockOnly', params.lowStockOnly)
      .set('pageNumber', params.pageNumber)
      .set('pageSize', params.pageSize);

    if (params.search) {
      httpParams = httpParams.set('search', params.search);
    }

    return this.http.get<InventoryResponse>(`${baseUrl}/AdminInventory/inventory`, {
      params: httpParams,
    });
  }


  createItem(request: CreateInventoryItemRequest): Observable<void> {
    return this.http.post<void>(`${baseUrl}/AdminInventory/inventory`, request);
  }


  updateQuantity(itemId: number, request: UpdateInventoryQuantityRequest): Observable<void> {
    return this.http.patch<void>(
      `${baseUrl}/AdminInventory/inventory/${itemId}/quantity`,
      request
    );
  }


  updateThreshold(itemId: number, request: UpdateInventoryThresholdRequest): Observable<void> {
    return this.http.patch<void>(
      `${baseUrl}/AdminInventory/inventory/${itemId}/threshold`,
      request
    );
  }


  deleteItem(itemId: number): Observable<void> {
    return this.http.delete<void>(`${baseUrl}/AdminInventory/inventory/${itemId}`);
  }
}
