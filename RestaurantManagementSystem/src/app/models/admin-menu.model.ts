export interface AdminMenuItem {
  id: number;
  name: string;
  description: string | null;
  price: number;
  imageUrl: string | null;
  isAvailable: boolean;
  foodType: FoodType;
  categoryId: number;
  categoryName: string;
}

export interface AdminMenuCategory {
  id: number;
  name: string;
  description: string | null;
  isAvailable: boolean;
}

export interface CreateMenuItemRequest {
  name: string;
  description: string | null;
  price: number;
  categoryId: number;
  foodType: FoodType;
  isAvailable?: boolean;
}

export interface UpdateMenuItemRequest {
  name: string;
  description: string | null;
  price: number;
  categoryId: number;
  foodType: FoodType;
  isAvailable?: boolean;
}

export interface UpdateMenuAvailabilityRequest {
  isAvailable: boolean;
}

export interface MenuSearchParams {
  search?: string;
  categoryId?: number;
  isAvailable?: boolean;
  foodType?: FoodType;
}

export enum FoodType {
  Veg = 0,
  NonVeg = 1
}
export interface CreateCategoryRequest {
  name: string;
  description: string | null;
  isAvailable?: boolean;
}

export interface UpdateCategoryRequest {
  name: string;
  description: string | null;
  isAvailable?: boolean;
}

/** Emitted by AdminCategoryModal for both create (no id) and update (with id) */
export type SaveCategoryRequest =
  | CreateCategoryRequest
  | (UpdateCategoryRequest & { id: number });