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
    console.log("token storing")
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  setSessionOtp(otp: string): void {
    localStorage.setItem('sessionOtp', otp);
    console.log("otp storing")
  }

  getSessionOtp(): string | null {
    return localStorage.getItem('sessionOtp');
  }

  clearSession(): void {
    localStorage.clear();
  }
}