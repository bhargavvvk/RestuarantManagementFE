import { Component, computed, inject, signal } from '@angular/core';
import { AdminAuditLogsService } from '../../../services/admin/admin-audit-logs';
import { toIsoDateString } from '../../../utils/date.utils';

@Component({
  selector: 'app-admin-audit-logs',
  imports: [],
  templateUrl: './admin-audit-logs.html',
  styleUrl: './admin-audit-logs.css',
})
export class AdminAuditLogs {
  private readonly auditLogsService = inject(AdminAuditLogsService);

  readonly today = toIsoDateString();

  readonly fromDate = signal(this.today);
  readonly toDate = signal(this.today);
  readonly downloading = this.auditLogsService.downloading;

  readonly isValid = computed(() => {
    const from = this.fromDate();
    const to = this.toDate();
    if (!from || !to) return false;
    return from <= to;
  });

  onFromDateChange(value: string): void {
    this.fromDate.set(value);
    // If toDate is now before fromDate, snap it forward
    if (this.toDate() < value) {
      this.toDate.set(value);
    }
  }

  onToDateChange(value: string): void {
    this.toDate.set(value);
  }

  onDownload(): void {
    if (!this.isValid()) return;
    this.auditLogsService.downloadLogs(this.fromDate(), this.toDate());
  }
}
