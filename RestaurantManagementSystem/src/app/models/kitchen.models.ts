export interface KitchenOrderItem {
  name: string;
  quantity: number;
}
export interface KitchenOrder {
  tableNumber: number;
  orderNumber: number;
  placedAt: string;
  items: KitchenOrderItem[];
}
