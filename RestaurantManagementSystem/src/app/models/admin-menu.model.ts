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

// ─── Ingredient models ───────────────────────────────────────────────────────

export interface Ingredient {
  id: number;
  name: string;
  description: string | null;
}

export interface CreateIngredientRequest {
  name: string;           // required, max 100
  description?: string | null;
}

export interface UpdateIngredientRequest {
  name: string;
  description?: string | null;
}

// ─── Menu-item ingredient assignment ─────────────────────────────────────────

export interface MenuItemIngredient {
  id: number;
  ingredientId: number;
  ingredientName: string;
  approxQuantity: number | null;
  unit: string | null;
}

export interface MenuItemIngredientEntry {
  ingredientId?: number;
  newIngredient?: {
    name: string;
    description?: string | null;
  };
  approxQuantity?: number | null;
  unit?: string | null;
}

export interface UpdateMenuItemIngredientsRequest {
  ingredients: MenuItemIngredientEntry[];
}

// ─── Nutrition models ─────────────────────────────────────────────────────────

export interface MenuItemNutrition {
  id: number;
  calories: number | null;
  protein: number | null;
  carbohydrates: number | null;
  fat: number | null;
  fiber: number | null;
  sugar: number | null;
  sodium: number | null;
}

export interface UpsertNutritionRequest {
  calories?: number | null;
  protein?: number | null;
  carbohydrates?: number | null;
  fat?: number | null;
  fiber?: number | null;
  sugar?: number | null;
  sodium?: number | null;
}