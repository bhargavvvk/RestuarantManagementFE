export interface WaiterTable {
  tableId: number;
  tableNumber: string;
  status: string;
}
export interface WaiterRequest {
  requestId: number;
  tableNumber: string;
  requestType: number;
  requestedAt: string;
}