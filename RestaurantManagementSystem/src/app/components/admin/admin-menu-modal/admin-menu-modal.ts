import { Component, effect, input, output, signal } from '@angular/core';
import {
  AdminMenuCategory,
  AdminMenuItem,
  CreateMenuItemRequest,
  FoodType,
  UpdateMenuItemRequest
} from '../../../models/admin-menu.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface MenuForm {
  name: string;
  description: string | null;
  categoryId: number;
  price: number;
  foodType: FoodType;
  isAvailable: boolean;
}

@Component({
  selector: 'app-admin-menu-modal',
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-menu-modal.html',
  styleUrl: './admin-menu-modal.css',
})
export class AdminMenuModal {

  readonly isOpen = input(false);
  readonly categories = input<AdminMenuCategory[]>([]);
  readonly menuItem = input<AdminMenuItem | null>(null);

  readonly save = output<{
    request: CreateMenuItemRequest | UpdateMenuItemRequest;
    image: File | null;
  }>();

  readonly close = output<void>();

  protected readonly FoodType = FoodType;

  readonly isSubmitting = signal(false);
  readonly selectedImage = signal<File | null>(null);
  readonly imagePreview = signal<string | null>(null);

  readonly form = signal<MenuForm>({
    name: '',
    description: '',
    categoryId: 0,
    price: 0,
    foodType: FoodType.Veg,
    isAvailable: true
  });

  constructor() {

    effect(() => {

      const item = this.menuItem();

      if (item) {

        this.form.set({
          name: item.name,
          description: item.description ?? '',
          categoryId: item.categoryId,
          price: item.price,
          foodType: item.foodType,
          isAvailable: item.isAvailable
        });

        this.imagePreview.set(item.imageUrl);

      } else {

        this.resetForm();

      }

    });

  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  readonly isEditMode = () => this.menuItem() !== null;

  readonly isValid = () => {

    const v = this.form();

    return (
      v.name.trim().length > 0 &&
      v.name.length <= 50 &&
      v.categoryId > 0 &&
      v.price > 0 &&
      (v.description?.length ?? 0) <= 100
    );

  };

  // ── Form updates ──────────────────────────────────────────────────────────

  update<K extends keyof MenuForm>(key: K, value: MenuForm[K]): void {
    this.form.update(current => ({ ...current, [key]: value }));
  }

  onAvailableToggle(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.form.update(f => ({ ...f, isAvailable: checked }));
  }

  // ── Image ─────────────────────────────────────────────────────────────────

  onImageSelected(event: Event): void {

    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) return;

    this.selectedImage.set(file);
    this.imagePreview.set(URL.createObjectURL(file));

  }

  // ── Save ──────────────────────────────────────────────────────────────────

  onSave(): void {

    if (!this.isValid()) return;

    this.isSubmitting.set(true);

    const f = this.form();

    const request: CreateMenuItemRequest | UpdateMenuItemRequest = {
      name: f.name.trim(),
      description: (f.description ?? '').trim() || null,
      categoryId: f.categoryId,
      price: f.price,
      foodType: f.foodType,
      isAvailable: f.isAvailable
    };

    this.save.emit({ request, image: this.selectedImage() });

  }

  // ── Close ─────────────────────────────────────────────────────────────────

  onClose(): void {
    this.resetForm();
    this.close.emit();
  }

  resetSubmitting(): void {
    this.isSubmitting.set(false);
  }

  // ── Reset ─────────────────────────────────────────────────────────────────

  private resetForm(): void {

    this.isSubmitting.set(false);
    this.selectedImage.set(null);
    this.imagePreview.set(null);

    this.form.set({
      name: '',
      description: '',
      categoryId: 0,
      price: 0,
      foodType: FoodType.Veg,
      isAvailable: true
    });

  }

}
