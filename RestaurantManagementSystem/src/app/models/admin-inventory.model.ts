export interface InventoryItem {
  id: number;
  itemName: string;
  currentQuantity: number;
  thresholdQuantity: number;
  unit: string;
  updatedAt: string;
}

export interface InventorySummary {
  totalItems: number;
  lowStockItems: number;
}

export interface InventoryPagedItems {
  items: InventoryItem[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
}

export interface InventoryResponse {
  summary: InventorySummary;
  items: InventoryPagedItems;
}

export interface CreateInventoryItemRequest {
  itemName: string;
  currentQuantity: number;
  thresholdQuantity: number;
  unit: string;
}

export interface UpdateInventoryQuantityRequest {
  quantity: number;
}

export interface UpdateInventoryThresholdRequest {
  thresholdQuantity: number;
}

export interface InventorySearchParams {
  search?: string;
  lowStockOnly: boolean;
  pageNumber: number;
  pageSize: number;
}
