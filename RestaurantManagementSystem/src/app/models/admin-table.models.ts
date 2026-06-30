export interface AdminTableSummary {
  totalTables: number;
  availableTables: number;
  occupiedTables: number;
  unavailableTables: number;
}

export interface AdminTable {
  id: number;
  tableNumber: string;
  status: 'Available' | 'Occupied' | 'Unavailable';
  assignedWaiterId?: number | null;
}

export interface AdminTablesDashboard {
  summary: AdminTableSummary;
  tables: AdminTable[];
}
export enum TableStatus {
    Available = 0,
    Unavailable = 1
}
export enum TableFilter {
    All = 'ALL',
    Available = 'Available',
    Occupied = 'Occupied',
    Unavailable = 'Unavailable'
}
export interface WaiterLookup {
    waiterId: number;
    name: string;
}
export interface WaitersResponse {
    waiters: WaiterLookup[];
}
export interface CreateTableRequest {
    tableNumber: string;
    capacity: number;
    assignedWaiterId: number | null;
}

export interface CreateTableResponse {
    id: number;
    tableNumber: string;
    capacity: number;
    qrIdentifier: string;
    status: number;
    assignedWaiterId: number;
}
export interface AssignWaiterRequest {
    tableId: number;
    waiterId: number;
}

export interface AssignWaiterResponse {
    id: number;
    tableNumber: string;
    capacity: number;
    qrIdentifier: string;
    status: number;
    assignedWaiterId: number;
}

export interface AdminTableDetail {
    tableId: number;
    tableNumber: string;
    status: string;
    assignedWaiterId: number;
    assignedWaiterName: string;
    sessionStartedAt: string;
}

export interface AdminTableOrderItem {
    orderItemId: number;
    itemName: string;
    itemPrice: number;
    quantity: number;
    status: number;
}

export interface AdminTableOrder {
    orderId: number;
    orderNumber: string;
    totalAmount: number;
    placedAt: string;
    specialInstructions: string;
    items: AdminTableOrderItem[];
}

export interface AdminTableBill {
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

export enum OrderItemStatus {
    Placed = 0,
    Preparing = 1,
    Ready = 2,
    Served = 3,
    Cancelled = 4
}