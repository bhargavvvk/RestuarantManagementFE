import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { TaxConfiguration, UpdateTaxRequest } from '../../models/admin-tax.models';
import { NotificationServices } from '../notification-services';
import { baseUrl } from '../../../environment';

@Injectable({
  providedIn: 'root',
})
export class AdminTaxService {
  private readonly http = inject(HttpClient);
  private readonly notification = inject(NotificationServices);

  readonly config = signal<TaxConfiguration | null>(null);
  readonly loading = signal(false);

  loadConfiguration(): void {
    this.loading.set(true);
    this.http
      .get<TaxConfiguration>(`${baseUrl}/Admin/tax-configuration`)
      .subscribe({
        next: response => {
          this.config.set(response);
          this.loading.set(false);
        },
        error: err => {
          this.notification.error(
            err.error?.Message ?? 'Unable to load tax configuration.'
          );
          this.loading.set(false);
        },
      });
  }

  updateConfiguration(request: UpdateTaxRequest): Observable<void> {
    return this.http.put<void>(`${baseUrl}/Admin/tax-configuration`, request);
  }
}
