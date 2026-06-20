import { Component, inject, signal } from '@angular/core';
import { Customer } from '../../../services/customer';
import { RequestType } from '../../../models/customer.models';
import { NotificationServices } from '../../../services/notification-services';

@Component({
  selector: 'app-customer-request',
  imports: [],
  templateUrl: './customer-request.html',
  styleUrl: './customer-request.css',
})
export class CustomerRequest {
  private customerService=inject(Customer)
  private notification=inject(NotificationServices)
sendRequest(type: RequestType) {
  this.customerService.sendRequest(type).subscribe({
   next: (res) => {
      this.notification.success("Request Sent Successfully!");
    },
    error: (err) => this.notification.error(err.message)
  });
}
}
