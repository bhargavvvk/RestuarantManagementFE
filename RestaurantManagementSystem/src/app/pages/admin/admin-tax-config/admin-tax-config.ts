import { Component, inject, OnInit, signal } from '@angular/core';
import { AdminTaxService } from '../../../services/admin/admin-tax';
import { AdminTaxCard } from '../../../components/admin/admin-tax-card/admin-tax-card';
import { AdminTaxEditModal } from '../../../components/admin/admin-tax-edit-modal/admin-tax-edit-modal';
import { NotificationServices } from '../../../services/notification-services';
import { UpdateTaxRequest } from '../../../models/admin-tax.models';

@Component({
  selector: 'app-admin-tax-config',
  imports: [AdminTaxCard, AdminTaxEditModal],
  templateUrl: './admin-tax-config.html',
  styleUrl: './admin-tax-config.css',
})
export class AdminTaxConfig implements OnInit {
  private readonly taxService = inject(AdminTaxService);
  private readonly notification = inject(NotificationServices);

  readonly config = this.taxService.config;
  readonly loading = this.taxService.loading;
  readonly showEditModal = signal(false);

  ngOnInit(): void {
    this.taxService.loadConfiguration();
  }

  openEditModal(): void {
    this.showEditModal.set(true);
  }

  closeEditModal(): void {
    this.showEditModal.set(false);
  }

  saveConfiguration(request: UpdateTaxRequest): void {
    this.taxService.updateConfiguration(request).subscribe({
      next: () => {
        this.notification.success('Tax configuration updated successfully.');
        this.closeEditModal();
        this.taxService.loadConfiguration();
      },
      error: err => {
        this.notification.error(
          err.error?.Message ?? 'Unable to update tax configuration.'
        );
      },
    });
  }
}
