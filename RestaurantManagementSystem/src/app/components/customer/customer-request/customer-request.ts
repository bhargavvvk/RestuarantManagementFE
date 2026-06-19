import { Component, inject, signal } from '@angular/core';
import { Customer } from '../../../services/customer';
import { RequestType } from '../../../models/customer.models';

@Component({
  selector: 'app-customer-request',
  imports: [],
  templateUrl: './customer-request.html',
  styleUrl: './customer-request.css',
})
export class CustomerRequest {
  private customerService=inject(Customer)
sendRequest(type: RequestType) {
  this.customerService.sendRequest(type).subscribe({
    next: () => console.log('Request sent successfully'),
    error: (err) => console.log(err.error.message)
  });
}
}
