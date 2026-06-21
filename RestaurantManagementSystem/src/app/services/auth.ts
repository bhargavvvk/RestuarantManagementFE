import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { baseUrl } from '../../environment';
import { LoginRequest, LoginResponse } from '../models/login.models';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Auth {

  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  login(request: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(
      `${baseUrl}/user/login`,
      request
    );
  }

  saveToken(token: string): void {
    localStorage.setItem('token', token);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getRole(): string | null {

    const token = this.getToken();

    if (!token) {
      return null;
    }

    try {

      const payload = JSON.parse(atob(token.split('.')[1]));

      return payload[
        'http://schemas.microsoft.com/ws/2008/06/identity/claims/role'
      ] ?? null;

    } catch {
      return null;
    }
  }

  logout(): void {
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }
  isTokenValid(): boolean {

    const token = this.getToken();

    if (!token) {
      return false;
    }

    try {

      const payload = JSON.parse(atob(token.split('.')[1]));

      const expiry = payload.exp;

      if (!expiry) {
        return false;
      }

      return Date.now() < expiry * 1000;

    } catch {
      return false;
    }
  }
}