export interface AdminOrderListItem {
  orderId: number;
  orderNumber: string;
  tableNumber: string;
  placedAt: string;
  itemCount: number;
  status: AdminOrderStatus;
}

export interface AdminOrdersPage {
  items: AdminOrderListItem[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
}

export interface AdminOrderDetailItem {
  itemName: string;
  quantity: number;
}

export interface AdminOrderDetail {
  orderId: number;
  orderNumber: string;
  tableNumber: string;
  placedAt: string;
  status: AdminOrderStatus;
  billNumber: string | null;
  billTotal: number | null;
  orderTotal: number;
  paymentMethod: string | null;
  items: AdminOrderDetailItem[];
}

export type AdminOrderStatus = 'Active' | 'Cancelled' | 'Completed' | string;

export interface AdminOrdersQuery {
  date?: string;
  search?: string;
  pageNumber: number;
  pageSize: number;
}
