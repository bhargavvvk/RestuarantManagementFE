export interface AdminWaiterSummary {
  totalWaiters: number;
  activeWaiters: number;
  inactiveWaiters: number;
}

export interface AdminWaiter {
  waiterId: number;
  name: string;
  isActive: boolean;
  assignedTableCount: number;
  assignedTables: string[];
}

export interface AdminWaitersDashboard {
  summary: AdminWaiterSummary;
  waiters: AdminWaiter[];
}

export enum WaiterFilter {
  All = 'ALL',
  Active = 'Active',
  Inactive = 'Inactive',
}

export interface CreateWaiterRequest {
  username: string;
  name: string;
  mobileNumber: string;
}
