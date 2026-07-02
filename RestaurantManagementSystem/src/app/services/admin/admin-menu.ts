import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { baseUrl } from '../../../environment';
import { AdminMenuCategory, AdminMenuItem, CreateCategoryRequest, CreateMenuItemRequest, FoodType, MenuSearchParams, UpdateCategoryRequest, UpdateMenuAvailabilityRequest, UpdateMenuItemRequest } from '../../models/admin-menu.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AdminMenu {
  private readonly http = inject(HttpClient);


  getMenuItems(filters?: MenuSearchParams): Observable<AdminMenuItem[]> {

    let params = new HttpParams();

    if (filters?.search) {
      params = params.set('search', filters.search);
    }

    if (filters?.categoryId) {
      params = params.set('categoryId', filters.categoryId);
    }

    if (filters?.isAvailable !== undefined) {
      params = params.set('isAvailable', filters.isAvailable);
    }

    if (filters?.foodType !== undefined) {
      params = params.set(
        'foodType',
        filters.foodType === FoodType.Veg ? 'Veg' : 'NonVeg'
      );
    }

    return this.http.get<AdminMenuItem[]>(`${baseUrl}/Menu`, { params });
  }

  createMenuItem(request: CreateMenuItemRequest, image: File | null): Observable<AdminMenuItem> {
    const form = new FormData();
    form.append('Name', request.name);
    form.append('CategoryId', request.categoryId.toString());
    form.append('Price', request.price.toString());
    form.append('FoodType', request.foodType.toString());
    form.append('IsAvailable', (request.isAvailable ?? true).toString());
    if (request.description) form.append('Description', request.description);
    if (image) form.append('Image', image);
    return this.http.post<AdminMenuItem>(`${baseUrl}/Admin/menu`, form);
  }

  updateMenuItem(menuItemId: number, request: UpdateMenuItemRequest, image: File | null): Observable<AdminMenuItem> {
    const url = `${baseUrl}/Admin/menu/${menuItemId}`;

    
    if (!image) {
      return this.http.put<AdminMenuItem>(url, request);
    }

    const form = new FormData();
    form.append('Name', request.name);
    form.append('CategoryId', request.categoryId.toString());
    form.append('Price', request.price.toString());
    form.append('FoodType', request.foodType.toString());
    form.append('IsAvailable', (request.isAvailable ?? true).toString());
    if (request.description) form.append('Description', request.description);
    form.append('Image', image);
    return this.http.put<AdminMenuItem>(url, form);
  }

  updateAvailability(menuItemId: number, request: UpdateMenuAvailabilityRequest): Observable<AdminMenuItem> {
    return this.http.patch<AdminMenuItem>(`${baseUrl}/Admin/menu/${menuItemId}/availability`, request);
  }

  deleteMenuItem(menuItemId: number): Observable<void> {
    return this.http.delete<void>(`${baseUrl}/Admin/menu/${menuItemId}`);
  }


  getCategories(): Observable<AdminMenuCategory[]> {
    return this.http.get<AdminMenuCategory[]>(`${baseUrl}/Menu/categories`);
  }

  createCategory(request: CreateCategoryRequest): Observable<AdminMenuCategory> {
    return this.http.post<AdminMenuCategory>(`${baseUrl}/Admin/categories`, request);
  }

  updateCategory(categoryId: number, request: UpdateCategoryRequest): Observable<AdminMenuCategory> {
    return this.http.put<AdminMenuCategory>(`${baseUrl}/Admin/categories/${categoryId}`, request);
  }

  updateCategoryAvailability(categoryId: number, isAvailable: boolean): Observable<AdminMenuCategory> {
    return this.http.patch<AdminMenuCategory>(
      `${baseUrl}/Admin/categories/${categoryId}/availability`,
      { isAvailable }
    );
  }

  deleteCategory(categoryId: number): Observable<void> {
    return this.http.delete<void>(`${baseUrl}/Admin/categories/${categoryId}`);
  }
}
