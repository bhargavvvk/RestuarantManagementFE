import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { baseUrl } from '../../../environment';
import {
  AdminMenuCategory,
  AdminMenuItem,
  CreateCategoryRequest,
  CreateIngredientRequest,
  CreateMenuItemRequest,
  FoodType,
  Ingredient,
  MenuItemIngredient,
  MenuItemNutrition,
  MenuSearchParams,
  UpdateCategoryRequest,
  UpdateIngredientRequest,
  UpdateMenuAvailabilityRequest,
  UpdateMenuItemIngredientsRequest,
  UpdateMenuItemRequest,
  UpsertNutritionRequest
} from '../../models/admin-menu.model';
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

  // ─── Ingredients library ────────────────────────────────────────────────────

  getIngredients(search?: string): Observable<Ingredient[]> {
    let params = new HttpParams();
    if (search) params = params.set('search', search);
    return this.http.get<Ingredient[]>(`${baseUrl}/Admin/ingredients`, { params });
  }

  getIngredient(id: number): Observable<Ingredient> {
    return this.http.get<Ingredient>(`${baseUrl}/Admin/ingredients/${id}`);
  }

  createIngredient(request: CreateIngredientRequest): Observable<Ingredient> {
    return this.http.post<Ingredient>(`${baseUrl}/Admin/ingredients`, request);
  }

  updateIngredient(id: number, request: UpdateIngredientRequest): Observable<Ingredient> {
    return this.http.put<Ingredient>(`${baseUrl}/Admin/ingredients/${id}`, request);
  }

  deleteIngredient(id: number): Observable<void> {
    return this.http.delete<void>(`${baseUrl}/Admin/ingredients/${id}`);
  }

  // ─── Menu item ingredients ──────────────────────────────────────────────────

  getMenuItemIngredients(menuItemId: number): Observable<MenuItemIngredient[]> {
    return this.http.get<MenuItemIngredient[]>(`${baseUrl}/Admin/menu/${menuItemId}/ingredients`);
  }

  updateMenuItemIngredients(menuItemId: number, request: UpdateMenuItemIngredientsRequest): Observable<MenuItemIngredient[]> {
    return this.http.put<MenuItemIngredient[]>(`${baseUrl}/Admin/menu/${menuItemId}/ingredients`, request);
  }

  // ─── Menu item nutrition ────────────────────────────────────────────────────

  getMenuItemNutrition(menuItemId: number): Observable<MenuItemNutrition> {
    return this.http.get<MenuItemNutrition>(`${baseUrl}/Admin/menu/${menuItemId}/nutrition`);
  }

  upsertMenuItemNutrition(menuItemId: number, request: UpsertNutritionRequest): Observable<MenuItemNutrition> {
    return this.http.put<MenuItemNutrition>(`${baseUrl}/Admin/menu/${menuItemId}/nutrition`, request);
  }

  deleteMenuItemNutrition(menuItemId: number): Observable<void> {
    return this.http.delete<void>(`${baseUrl}/Admin/menu/${menuItemId}/nutrition`);
  }
}
