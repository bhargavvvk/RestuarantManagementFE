import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { baseUrl } from '../../../environment';
import {
  RestaurantConfig,
  UpdateKnowledgeBaseRequest,
  UpdateRestaurantDetailsRequest
} from '../../models/restaurant-config.model';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class RestaurantConfigService {
  private readonly http = inject(HttpClient);

  getConfig(): Observable<RestaurantConfig> {
    return this.http.get<RestaurantConfig>(`${baseUrl}/restaurant`);
  }

  updateDetails(request: UpdateRestaurantDetailsRequest): Observable<RestaurantConfig> {
    return this.http.put<RestaurantConfig>(`${baseUrl}/restaurant/details`, request);
  }

  updateKnowledgeBase(request: UpdateKnowledgeBaseRequest): Observable<RestaurantConfig> {
    return this.http.put<RestaurantConfig>(`${baseUrl}/restaurant/knowledge-base`, request);
  }
}
