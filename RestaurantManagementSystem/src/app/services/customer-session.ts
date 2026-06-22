import { Injectable, signal } from '@angular/core';
@Injectable({
  providedIn: 'root',
})

export class CustomerSession {
    hasToken(): boolean {
    return !!localStorage.getItem('token');
  }
  setToken(token: string): void {
    localStorage.setItem('token', token);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  setSessionOtp(otp: string): void {
    localStorage.setItem('sessionOtp', otp);
  }

  getSessionOtp(): string | null {
    return localStorage.getItem('sessionOtp');
  }

  clearSession(): void {
    localStorage.clear();
  }
}