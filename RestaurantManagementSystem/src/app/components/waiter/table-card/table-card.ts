import {
  Component,
  EventEmitter,
  Input,
  Output
} from '@angular/core';
import { WaiterTable } from '../../../models/waiter.models';

@Component({
  selector: 'app-table-card',
  imports: [],
  templateUrl: './table-card.html',
  styleUrl: './table-card.css'
})
export class TableCard {

  @Input({ required: true })
  table!: WaiterTable;

  @Output()
  tableClicked = new EventEmitter<number>();

  onClick(): void {

    if (!this.isClickable) {
      return;
    }

    this.tableClicked.emit(
      this.table.tableId
    );

  }

  get cardClass(): string {

    switch (this.table.status.toLowerCase()) {

      case 'available':
        return 'card-available';

      case 'occupied':
        return 'card-occupied';

      case 'unavailable':
        return 'card-unavailable';

      case 'billrequested':
      case 'bill requested':
        return 'card-bill';

      default:
        return 'card-available';
    }
  }
  get isClickable(): boolean {

    const status =
      this.table.status.toLowerCase();

    return !(
      status === 'available' ||
      status === 'unavailable'
    );

  }
}