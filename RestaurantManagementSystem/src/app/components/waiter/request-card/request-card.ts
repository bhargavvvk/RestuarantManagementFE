import { Component, EventEmitter, Input, Output } from '@angular/core';
import { WaiterRequest } from '../../../models/waiter.models';
import { DatePipe, NgClass } from '@angular/common';

@Component({
  selector: 'app-request-card',
  imports: [DatePipe, NgClass],
  templateUrl: './request-card.html',
  styleUrl: './request-card.css',
})
export class RequestCard {

  @Input({ required: true })
  request!: WaiterRequest;

  @Output()
  complete = new EventEmitter<number>();

  onComplete(): void {
    this.complete.emit(this.request.requestId);
  }

  get title(): string {

    switch (this.request.requestType) {

      case 0:
        return 'Call Waiter';

      case 1:
        return 'Need Water';

      case 2:
        return 'Bill Request';

      default:
        return 'Unknown Request';
    }
  }

  get icon(): string {

    switch (this.request.requestType) {

      case 0:
        return 'front_hand';

      case 1:
        return 'water_drop';

      case 2:
        return 'receipt_long';

      default:
        return 'help';
    }
  }

  get cardClass(): string {

    switch (this.request.requestType) {

      case 0:
        return 'call-waiter';

      case 1:
        return 'need-water';

      case 2:
        return 'bill-request';

      default:
        return '';
    }
  }

}
