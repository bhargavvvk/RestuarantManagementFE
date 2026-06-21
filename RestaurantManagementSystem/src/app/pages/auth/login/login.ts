import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Auth } from '../../../services/auth';
import { LoginRequest } from '../../../models/login.models';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  private readonly router = inject(Router);
  private readonly authService = inject(Auth);
  readonly isLoading = signal(false);
  readonly errorMessage = signal('');
  readonly username = signal('');
  readonly password = signal('');
  readonly showPassword = signal(false);
    ngOnInit(): void {

    if (!this.authService.isTokenValid()) {
      this.authService.logout();
      return;
    }

    const role = this.authService.getRole();

    switch (role) {

      case 'Waiter':
        this.router.navigate(['/waiter']);
        break;

      case 'KitchenStaff':
        this.router.navigate(['/kitchen']);
        break;

      case 'Admin':
        this.router.navigate(['/admin']);
        break;

      case 'Customer':
        break;
    }
  }
  readonly isFormValid = computed(() =>
    this.username().trim().length > 0 &&
    this.password().trim().length > 0
  );
  togglePassword(): void {
    this.showPassword.update(value => !value);
  }

  login(): void {

    if (!this.isFormValid() || this.isLoading()) {
      return;
    }

    this.errorMessage.set('');
    this.isLoading.set(true);

    const request: LoginRequest = {
      username: this.username(),
      password: this.password()
    };

    this.authService.login(request).subscribe({
      next: response => {

        this.authService.saveToken(response.token);
        this.isLoading.set(false);
        this.navigateByRole(response.role);
      },

      error: error => {

        this.errorMessage.set(
          error?.error?.Message ?? 'Login failed'
        );

        this.isLoading.set(false);
      }
    });
  }
  private navigateByRole(role: string): void {

    switch (role) {

      case 'Waiter':
        this.router.navigate(['/waiter']);
        break;

      case 'KitchenStaff':
        this.router.navigate(['/kitchen']);
        break;

      case 'Admin':
        this.router.navigate(['/admin']);
        break;

      default:
        this.errorMessage.set('Invalid role');
        break;
    }
  }
}