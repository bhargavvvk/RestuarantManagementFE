import { Component, inject, input, signal } from '@angular/core';
import { CreateSessionRequest } from '../../../models/customer.models';
import { FormsModule } from '@angular/forms';
import { form, FormField, pattern, required, submit } from '@angular/forms/signals';
import { Customer } from '../../../services/customer';
import { firstValueFrom } from 'rxjs';
import { CustomerSession } from '../../../services/customer-session';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-create-session-card',
  imports: [FormsModule, FormField],
  templateUrl: './create-session-card.html',
  styleUrl: './create-session-card.css',
})
export class CreateSessionCard {
  private customerSession = inject(CustomerSession);
  private customerService = inject(Customer);
  private router = inject(Router);
  serverError = signal<string | null>(null);
  tableIdentifier = input.required<string>();
    tableNumber = input.required<string>();
  formModel = signal<CreateSessionRequest>({
    customerName: '',
    phoneNumber: '',
  });

  createSessionForm = form(this.formModel, (path) => {
    required(path.customerName, {
      message: 'Customer name is required',
    });

    required(path.phoneNumber, {
      message: 'Phone number is required',
    });

    pattern(path.phoneNumber, /^\d{10}$/, {
      message: 'Phone number must be 10 digits',
    });
  });

  progress = signal(false);
  createSession(): void {
    this.serverError.set(null);
    submit(this.createSessionForm, (field) => {
      this.progress.set(true);
      return firstValueFrom(
        this.customerService.createSession(this.tableIdentifier(), field().value())
      ).then((response) => {
        this.customerSession.setToken(response.token);
        this.customerSession.setSessionOtp(response.sessionOtp);
       this.router.navigate(['/join',this.tableIdentifier(),'operations']);
      }).catch((error) => {
        this.serverError.set(
          this.getCreateSessionErrorMessage(error)
        );
      }).finally(() => {
        this.progress.set(false);
      });
    });
  }
  private getCreateSessionErrorMessage(error: unknown): string {
  if (!(error instanceof HttpErrorResponse)) {
    return 'Unable to join session. Please try again.';
  }

  const message = error.error?.Message;

  switch (message) {
    case 'no active dining session found for the table':
      return 'No active dining session found for the table';

    case 'Invalid session OTP.':
      return 'Invalid OTP';

    default:
      return message || 'Unable to join session. Please try again.';
  }
}
}
