export interface WaiterTable {
  tableId: number;
  tableNumber: string;
  status: string;
  sessionId: number | null;
}
export interface WaiterRequest {
  requestId: number;
  tableNumber: string;
  requestType: number;
  requestedAt: string;
}
export interface WaiterCartItem {
  id: number;
  menuItemId: number;
  menuItemName: string;
  quantity: number;
  price: number;
  isAvailable: boolean;
}

export interface MenuCategory {
  id: number;
  name: string;
  description: string | null;
  isAvailable: boolean;
}

export interface MenuItem {
  id: number;
  name: string;
  description: string | null;
  price: number;
  imageUrl: string | null;
  isAvailable: boolean;
  foodType: number;
  categoryId: number;
  categoryName: string;
}