export interface KitchenOrderItem {
  orderItemId: number;
  itemName: string;
  quantity: number;
  status: number; // 0=Queued, 1=Preparing, 2=Ready, 3=Served
}

export interface KitchenOrder {
  orderId: number;
  orderNumber: string;
  tableNumber: string;
  placedAt: string;
  items: KitchenOrderItem[];
}

export interface KitchenDashboardResponse {
  queueCount: number;
  preparingCount: number;
  readyCount: number;
  orders: KitchenOrder[];
}

export interface KitchenNotification {
  tableNumber: string;
  orderNumber: string;
  message: string;
}