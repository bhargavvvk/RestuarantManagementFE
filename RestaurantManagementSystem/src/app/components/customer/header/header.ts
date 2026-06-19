import { Component, computed, Input, input } from '@angular/core';

export type HeaderVariant =
  | 'create-session'
  | 'join-session'
  | 'after-session';


@Component({
  selector: 'app-header',
  imports: [],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  tableNumber = input.required<string>();
  variant = input<HeaderVariant>('create-session');
  otp = input<string | null>(null);
  showSessionStatus = computed(() =>
    this.variant() === 'join-session' ||
    this.variant() === 'after-session'
  );
  showOtp = computed(() =>
    this.variant() === 'after-session'
  );
}
