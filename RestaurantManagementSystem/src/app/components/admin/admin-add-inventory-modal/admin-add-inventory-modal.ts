import { Component, effect, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CreateInventoryItemRequest } from '../../../models/admin-inventory.model';

interface AddInventoryForm {
  itemName: string;
  currentQuantity: number;
  thresholdQuantity: number;
  unit: string;
}

@Component({
  selector: 'app-admin-add-inventory-modal',
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-add-inventory-modal.html',
  styleUrl: './admin-add-inventory-modal.css',
})
export class AdminAddInventoryModal {

  readonly isOpen = input(false);

  readonly save = output<CreateInventoryItemRequest>();
  readonly close = output<void>();

  readonly isSubmitting = signal(false);

  readonly form = signal<AddInventoryForm>({
    itemName: '',
    currentQuantity: 0,
    thresholdQuantity: 0,
    unit: '',
  });

  constructor() {
    effect(() => {
      if (this.isOpen()) {
        this.resetForm();
      }
    });
  }


  readonly isValid = () => {
    const f = this.form();
    return (
      f.itemName.trim().length > 0 &&
      f.unit.trim().length > 0 &&
      f.currentQuantity >= 0 &&
      f.thresholdQuantity >= 0
    );
  };


  update<K extends keyof AddInventoryForm>(key: K, value: AddInventoryForm[K]): void {
    this.form.update(current => ({ ...current, [key]: value }));
  }


  onSave(): void {
    if (!this.isValid()) return;

    this.isSubmitting.set(true);

    const f = this.form();
    const request: CreateInventoryItemRequest = {
      itemName: f.itemName.trim(),
      currentQuantity: f.currentQuantity,
      thresholdQuantity: f.thresholdQuantity,
      unit: f.unit.trim(),
    };

    this.save.emit(request);
  }


  onClose(): void {
    this.resetForm();
    this.close.emit();
  }

  resetSubmitting(): void {
    this.isSubmitting.set(false);
  }


  private resetForm(): void {
    this.isSubmitting.set(false);
    this.form.set({
      itemName: '',
      currentQuantity: 0,
      thresholdQuantity: 0,
      unit: '',
    });
  }
}
