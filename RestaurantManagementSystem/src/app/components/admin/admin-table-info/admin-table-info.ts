import { Component, input } from '@angular/core';
import { AdminTableDetail } from '../../../models/admin-table.models';
import { formatTime12Hour } from '../../../utils/date.utils';

@Component({
  selector: 'app-admin-table-info',
  imports: [],
  templateUrl: './admin-table-info.html',
  styleUrl: './admin-table-info.css',
})
export class AdminTableInfo {
  readonly detail = input.required<AdminTableDetail>();

  formatTime = formatTime12Hour;
}
