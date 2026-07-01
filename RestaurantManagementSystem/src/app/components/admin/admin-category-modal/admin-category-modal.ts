import { Component, input, output, signal } from '@angular/core';
import {
  AdminMenuCategory,
  SaveCategoryRequest
} from '../../../models/admin-menu.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface EditState {
  id: number;
  name: string;
  description: string;
}

@Component({
  selector: 'app-admin-category-modal',
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-category-modal.html',
  styleUrl: './admin-category-modal.css',
})
export class AdminCategoryModal {

  // ── Inputs ────────────────────────────────────────────────────────────────
  readonly isOpen = input(false);
  readonly categories = input<AdminMenuCategory[]>([]);

  // ── Outputs ───────────────────────────────────────────────────────────────
  readonly saveCategory = output<SaveCategoryRequest>();
  readonly toggleAvailability = output<{ id: number; isAvailable: boolean }>();
  readonly deleteCategory = output<number>();
  readonly close = output<void>();

  // ── Add-new form state ────────────────────────────────────────────────────
  readonly showAddForm = signal(false);
  readonly newName = signal('');
  readonly newDescription = signal('');
  readonly newIsAvailable = signal(true);
  readonly isAddSubmitting = signal(false);

  // ── Inline-edit state ─────────────────────────────────────────────────────
  readonly editState = signal<EditState | null>(null);
  readonly isSavingEdit = signal(false);

  // ── Derived helpers ───────────────────────────────────────────────────────

  readonly isNewValid = () =>
    this.newName().trim().length > 0 && this.newName().length <= 50 && (this.newDescription().length ?? 0) <= 100;

  readonly isEditValid = () => {
    const s = this.editState();
    return s !== null && s.name.trim().length > 0 && s.name.length <= 50 && (s.description?.length ?? 0) <= 100;
  };

  // ── Add new category ──────────────────────────────────────────────────────

  openAddForm(): void {
    this.showAddForm.set(true);
    this.newName.set('');
    this.newDescription.set('');
    this.newIsAvailable.set(true);
  }

  cancelAdd(): void {
    this.showAddForm.set(false);
    this.newIsAvailable.set(true);
  }

  submitAdd(): void {
    if (!this.isNewValid()) return;
    this.isAddSubmitting.set(true);
    const req: SaveCategoryRequest = {
      name: this.newName().trim(),
      description: this.newDescription().trim() || null,
      isAvailable: this.newIsAvailable()
    };
    this.saveCategory.emit(req);
    this.showAddForm.set(false);
    this.isAddSubmitting.set(false);
    this.newName.set('');
    this.newDescription.set('');
    this.newIsAvailable.set(true);
  }

  // ── Inline edit category ──────────────────────────────────────────────────

  startEdit(category: AdminMenuCategory): void {
    this.editState.set({
      id: category.id,
      name: category.name,
      description: category.description ?? ''
    });
  }

  cancelEdit(): void {
    this.editState.set(null);
  }

  submitEdit(): void {
    const state = this.editState();
    if (!state || !this.isEditValid()) return;
    this.isSavingEdit.set(true);
    const req: SaveCategoryRequest = {
      id: state.id,
      name: state.name.trim(),
      description: state.description.trim() || null
    };
    this.saveCategory.emit(req);
    this.editState.set(null);
    this.isSavingEdit.set(false);
  }

  updateEditField(field: 'name' | 'description', value: string): void {
    this.editState.update(s => s ? { ...s, [field]: value } : s);
  }

  // ── Toggle & delete ───────────────────────────────────────────────────────

  onToggle(category: AdminMenuCategory, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.toggleAvailability.emit({ id: category.id, isAvailable: checked });
  }

  onDelete(id: number): void {
    if (!confirm('Delete this category? Items assigned to it will be unaffected.')) return;
    this.deleteCategory.emit(id);
  }

  // ── Close panel ───────────────────────────────────────────────────────────

  onClose(): void {
    this.showAddForm.set(false);
    this.editState.set(null);
    this.close.emit();
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  isEditing(id: number): boolean {
    return this.editState()?.id === id;
  }

  getItemCount(category: AdminMenuCategory): string {
    // We don't have item counts from the category list API; display availability only
    return category.isAvailable ? 'ACTIVE' : 'UNAVAILABLE';
  }

}
