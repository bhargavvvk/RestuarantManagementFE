import { Component, effect, input, model, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { form, FormField, min, required, submit } from '@angular/forms/signals';
import { CreateTableRequest, WaiterLookup } from '../../../models/admin-table.models';

@Component({
  selector: 'app-admin-table-modal',
  imports: [FormsModule, FormField],
  templateUrl: './admin-table-modal.html',
  styleUrl: './admin-table-modal.css',
})
export class AddTableModal {

  readonly isOpen = input.required<boolean>();

  readonly waiters = input.required<WaiterLookup[]>();

  readonly closed = output<void>();

  readonly tableCreated = output<CreateTableRequest>();

  readonly createTableModel = model<CreateTableRequest>({
    tableNumber: '',
    capacity: 1,
    assignedWaiterId: null as number | null
  });

  readonly createTableForm = form(
    this.createTableModel,
    model => {

      required(model.tableNumber);

      required(model.capacity);
      min(model.capacity, 1);

      required(model.assignedWaiterId);
      min(model.assignedWaiterId, 1);

    }
  );

  constructor() {

    effect(() => {

      if (this.isOpen()) {

        this.createTableModel.set({
          tableNumber: '',
          capacity: 1,
          assignedWaiterId: 0
        });

      }

    });

  }

  close(): void {

    this.closed.emit();

  }

  onWaiterSelected(event: Event): void {
    const value = Number((event.target as HTMLSelectElement).value);
    this.createTableForm.assignedWaiterId().value.set(value);
  }

  create(): void {
    submit(this.createTableForm, () => {
      this.tableCreated.emit(this.createTableModel());
      return Promise.resolve();
    });
  }
}