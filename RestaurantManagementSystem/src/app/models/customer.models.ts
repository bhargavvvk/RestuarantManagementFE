export interface TableInfo {
  tableNumber: string;
  isAvailable: boolean;
  hasActiveSession: boolean;
}
export interface CreateSessionRequest {
    customerName: string;
    phoneNumber: string;
}
export interface CreateSessionResponse {
  token: string;
  sessionOtp: string;
}
export interface JoinSessionRequest {
  sessionOtp: string;
}
export interface JoinSessionResponse {
  token: string;
   sessionOtp: string;
}
export interface ValidateSessionResponse {
  isActive: boolean;
  tableIdentifier:string;
}
export enum RequestType {
  CallWaiter = 0,
  NeedWater = 1,
  RequestBill = 2
}
export interface Category {
  id: number;
  name: string;
  description: string;
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
export interface CartItem {
  id: number;
  menuItemId: number;
  menuItemName: string;
  quantity: number;
  price: number;
  isAvailable: boolean;
}
export interface CustomerOrderItem {
  orderItemId: number;
  itemName: string;
  itemPrice: number;
  quantity: number;
  status: number;
}
export interface CustomerOrder {
  orderId: number;
  orderNumber: string;
  totalAmount: number;
  placedAt: string;
  specialInstructions: string;
  items: CustomerOrderItem[];
}
export interface CustomerBill {
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
}