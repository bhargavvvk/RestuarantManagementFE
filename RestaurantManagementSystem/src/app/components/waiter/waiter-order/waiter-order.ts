import { Component, inject } from '@angular/core';
import { NotificationServices } from '../../../services/notification-services';
import { WaiterTableService } from '../../../services/waiter-table';
import { ActivatedRoute } from '@angular/router';
import { formatTime12Hour } from '../../../utils/date.utils';

@Component({
  selector: 'app-waiter-order',
  imports: [],
  templateUrl: './waiter-order.html',
  styleUrl: './waiter-order.css',
})
export class WaiterOrder {
  readonly menuService = inject(WaiterTableService);
  private readonly route =inject(ActivatedRoute);
  readonly tableId = Number(this.route.snapshot.paramMap.get('tableId'));
  private readonly notification = inject(NotificationServices);
  orders = this.menuService.orders;
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
  formatTime = formatTime12Hour;
  markServed(
  orderItemId: number
  ): void {

    this.menuService
      .markServed(
        this.tableId,
        orderItemId
      )
      .subscribe({

        next: response => {

          this.menuService
            .updateOrderItemStatus(
              response.orderItemId,
              response.status
            );

        },

        error: err => {

          this.notification.error(
            err.error?.Message ??
            'Failed to mark item as served'
          );

        }

      });

  }
}
