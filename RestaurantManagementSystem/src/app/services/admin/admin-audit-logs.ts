import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { baseUrl } from '../../../environment';
import { NotificationServices } from '../notification-services';
import { toIsoDateString } from '../../utils/date.utils';

@Injectable({
  providedIn: 'root',
})
export class AdminAuditLogsService {
  private readonly http = inject(HttpClient);
  private readonly notification = inject(NotificationServices);

  readonly fromDate = signal(toIsoDateString());
  readonly toDate = signal(toIsoDateString());
  readonly downloading = signal(false);

  downloadLogs(fromDate: string, toDate: string): void {
    this.downloading.set(true);

    const params = new HttpParams()
      .set('fromDate', fromDate)
      .set('toDate', toDate);

    this.http
      .get(`${baseUrl}/Admin/auditlogs/download`, {
        params,
        responseType: 'blob',
        observe: 'response',
      })
      .subscribe({
        next: response => {
          const blob = response.body!;

          // Try to get filename from Content-Disposition header
          const disposition = response.headers.get('Content-Disposition');
          let filename = `audit-logs-${fromDate}-to-${toDate}.csv`;
          if (disposition) {
            const match = disposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
            if (match?.[1]) {
              filename = match[1].replace(/['"]/g, '');
            }
          }

          const url = URL.createObjectURL(blob);
          const anchor = document.createElement('a');
          anchor.href = url;
          anchor.download = filename;
          anchor.click();
          URL.revokeObjectURL(url);

          this.downloading.set(false);
        },
        error: err => {
          this.notification.error(
            err.error?.Message ?? err.error?.message ?? 'Failed to download audit logs.'
          );
          this.downloading.set(false);
        },
      });
  }
}
