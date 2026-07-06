import { Component, inject, input, output, signal, computed, effect } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AdminTable } from '../../../models/admin-table.models';
import { NotificationServices } from '../../../services/notification-services';
import { baseUrl } from '../../../../environment';

@Component({
  selector: 'app-admin-download-qr-modal',
  imports: [],
  templateUrl: './admin-download-qr-modal.html',
  styleUrl: './admin-download-qr-modal.css',
})
export class AdminDownloadQrModal {
  private readonly http = inject(HttpClient);
  private readonly notification = inject(NotificationServices);

  readonly isOpen = input.required<boolean>();
  readonly tables = input.required<AdminTable[]>();
  readonly closed = output<void>();

  readonly selectedIds = signal<Set<number>>(new Set());
  readonly downloading = signal(false);

  readonly allSelected = computed(() =>
    this.tables().length > 0 &&
    this.tables().every(t => this.selectedIds().has(t.id))
  );

  readonly selectedCount = computed(() => this.selectedIds().size);

  constructor() {
    effect(() => {
      if (this.isOpen()) {
        this.selectedIds.set(new Set());
        this.downloading.set(false);
      }
    });
  }

  toggleAll(): void {
    if (this.allSelected()) {
      this.selectedIds.set(new Set());
    } else {
      this.selectedIds.set(new Set(this.tables().map(t => t.id)));
    }
  }

  toggleTable(id: number): void {
    const next = new Set(this.selectedIds());
    next.has(id) ? next.delete(id) : next.add(id);
    this.selectedIds.set(next);
  }

  isSelected(id: number): boolean {
    return this.selectedIds().has(id);
  }

  close(): void {
    this.closed.emit();
  }

  downloadAll(): void {
    const ids = Array.from(this.selectedIds());
    if (ids.length === 0) return;

    this.downloading.set(true);
    let completed = 0;
    let failed = 0;

    ids.forEach(id => {
      const table = this.tables().find(t => t.id === id);
      this.http
        .get(`${baseUrl}/admin/${id}/qr`, { responseType: 'blob' })
        .subscribe({
          next: blob => {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `QR_${table?.tableNumber ?? id}.png`;
            a.click();
            URL.revokeObjectURL(url);
            completed++;
            if (completed + failed === ids.length) this.onAllDone(completed, failed);
          },
          error: () => {
            failed++;
            if (completed + failed === ids.length) this.onAllDone(completed, failed);
          },
        });
    });
  }

  private onAllDone(completed: number, failed: number): void {
    this.downloading.set(false);
    if (completed > 0) {
      this.notification.success(
        `Downloaded ${completed} QR code${completed > 1 ? 's' : ''} successfully.`
      );
    }
    if (failed > 0) {
      this.notification.error(`Failed to download ${failed} QR code${failed > 1 ? 's' : ''}.`);
    }
    if (completed > 0) {
      this.close();
    }
  }
}
