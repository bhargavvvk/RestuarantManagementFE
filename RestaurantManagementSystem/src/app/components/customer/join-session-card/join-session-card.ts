import { Component, computed, ElementRef, inject, input, QueryList, signal, ViewChildren } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import {
  form,
  FormField,
  maxLength,
  pattern,
  required,
  submit
} from '@angular/forms/signals';
import { firstValueFrom } from 'rxjs';

import {
  JoinSessionRequest
} from '../../../models/customer.models';

import { Customer } from '../../../services/customer';
import { CustomerSession } from '../../../services/customer-session';
import { routes } from '../../../app.routes';
import { Router } from '@angular/router';

@Component({
  selector: 'app-join-session-card',
  imports: [FormsModule],
  templateUrl: './join-session-card.html',
  styleUrl: './join-session-card.css',
})
export class JoinSessionCard {
   private customerSession = inject(CustomerSession);
   private customerService = inject(Customer);
   private router=inject(Router);
  submitAttempted = signal(false);
  @ViewChildren('otpInput')
  otpInputs!: QueryList<ElementRef<HTMLInputElement>>;
  otpDigits = signal(['', '', '', '']);
  tableIdentifier = input.required<string>();
  progress = signal(false);
  serverError = signal<string | null>(null);
  isOtpComplete = computed(() =>
      this.otpDigits().every(digit => digit !== '')
  );
  onOtpInput(index: number, event: Event): void {
      const input = event.target as HTMLInputElement;
      const value = input.value.replace(/\D/g, '');
      this.serverError.set(null);
      this.otpDigits.update((digits) =>
        digits.map((digit, digitIndex) => digitIndex === index ? value : digit)
      );
      input.value = value;
      if (value && index < 3) {
          this.otpInputs.get(index + 1)?.nativeElement.focus();
      }
      this.updateOtp();
  }
  onOtpKeyDown(index: number, event: KeyboardEvent): void {
      if (
          event.key === 'Backspace' &&
          !this.otpDigits()[index] &&
          index > 0
      ) {
          this.otpInputs.get(index - 1)?.nativeElement.focus();
      }
  }
  private updateOtp(): void {
      const otp = this.otpDigits().join('');
      this.joinSessionForm.sessionOtp().value.set(otp);
  }
  formModel = signal<JoinSessionRequest>({
    sessionOtp: '',
  });

  joinSessionForm = form(this.formModel, (path) => {

    required(path.sessionOtp, {
      message: 'OTP is required',
    });

    maxLength(path.sessionOtp, 4, {
      message: 'OTP must be 4 digits',
    });

    pattern(path.sessionOtp, /^\d{4}$/, {
      message: 'OTP must be 4 digits',
    });

  });
  async joinSession(): Promise<void> {

  this.submitAttempted.set(true);

  this.serverError.set(null);

  if (!this.isOtpComplete()) {
    return;
  }

  await submit(this.joinSessionForm, {
    action: async (field) => {

      this.progress.set(true);

      try {

        const response = await firstValueFrom(
          this.customerService.joinSession(
            this.tableIdentifier(),
            field().value()
          )
        );

        this.customerSession.setToken(response.token);

        this.customerSession.setSessionOtp(response.sessionOtp);

        console.log('Session Joined:', response);

       this.router.navigate(['/join',this.tableIdentifier(),'operations']);

      } catch (error) {

        this.serverError.set(
          this.getJoinSessionErrorMessage(error)
        );

      } finally {

        this.progress.set(false);
      }
    }
  });
}
  private getJoinSessionErrorMessage(error: unknown): string {

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