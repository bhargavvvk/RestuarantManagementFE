export interface AdminBillListItem {
  billId: number;
  billNumber: string;
  tableNumber: string;
  generatedAt: string;
  grandTotal: number;
}

export interface AdminBillsPage {
  items: AdminBillListItem[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
}

export interface AdminBillsSummary {
  totalBills: number;
  totalRevenue: number;
}

export interface AdminBillDetail {
  billNumber: string;
  generatedAt: string;
  tableNumber: string;
  waiterId: number;
  waiterName: string;
  paymentMethod: string | null;
  paymentStatus: string | null;
  foodTotal: number;
  cgstPercentage: number;
  cgstAmount: number;
  sgstPercentage: number;
  sgstAmount: number;
  serviceChargePercentage: number;
  serviceChargeAmount: number;
  grandTotal: number;
}

export interface AdminBillsQuery {
  date?: string;
  search?: string;
  pageNumber: number;
  pageSize: number;
}
