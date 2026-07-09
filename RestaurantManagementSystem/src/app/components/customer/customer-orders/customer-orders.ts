import { Component, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MenuService } from '../../../services/menu-service';
import { CustomerBill, CustomerOrder } from '../../../models/customer.models';
import { forkJoin } from 'rxjs';
import { formatTime12Hour } from '../../../utils/date.utils';
import { SplitBillModal } from '../../menu/split-bill-modal/split-bill-modal';

@Component({
  selector: 'app-customer-orders',
  imports: [CommonModule, SplitBillModal],
  templateUrl: './customer-orders.html',
  styleUrl: './customer-orders.css',
})
export class CustomerOrders {
  readonly menuService = inject(MenuService);
  readonly splitVisible = signal(false);
  orders = this.menuService.orders;
  bill = this.menuService.bill;

  getParsedSplits() {
    const b = this.bill();
    if (!b || !b.customSplitsJson) return null;
    try {
      return JSON.parse(b.customSplitsJson);
    } catch {
      return null;
    }
  }
  getItemStatus(status: number): string {
    switch (status) {

      case 0:
        return 'Placed';

      case 1:
        return 'Preparing';

      case 2:
        return 'Ready';

      case 3:
        return 'Served';

      case 4:
        return 'Cancelled';

      default:
        return 'Unknown';
    }
  }
  getItemStatusClass(status: number): string {

    switch (status) {

      case 0:
        return 'placed';

      case 1:
        return 'preparing';

      case 2:
        return 'ready';

      case 3:
        return 'served';

      case 4:
        return 'cancelled';

      default:
        return 'placed';
    }

  }
    getPaymentStatus(status: number): string {
    return status === 1
      ? 'Paid'
      : 'Pending';
  }
  formatTime = formatTime12Hour;
}
