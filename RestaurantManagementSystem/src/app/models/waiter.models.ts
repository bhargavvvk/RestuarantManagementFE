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
export interface WaiterOrderItem {
  orderItemId: number;
  itemName: string;
  itemPrice: number;
  quantity: number;
  status: number;
}
export interface WaiterOrder {
  orderId: number;
  orderNumber: string;
  totalAmount: number;
  placedAt: string;
  specialInstructions: string;
  items: WaiterOrderItem[];
}
export interface WaiterBill {
  billNumber: string;
  foodTotal: number;
  cgstPercentage: number;
  cgstAmount: number;
  sgstPercentage: number;
  sgstAmount: number;
  serviceChargePercentage: number;
  serviceChargeAmount: number;
  grandTotal: number;
  paymentStatus: number;
  generatedAt: string;
  customSplitsJson?: string;
}
export interface ServedOrderItemResponse {
  orderItemId: number;
  itemName: string;
  itemPrice: number;
  quantity: number;
  status: number;
}
export interface PaymentMethod {
  value: number;
  name: string;
}

export type { SplitBillResponse, OrderSplitOption, ItemSplitOption } from './customer.models';