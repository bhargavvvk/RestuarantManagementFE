import { Component, effect, input, output, signal } from '@angular/core';
import {
  CreateIngredientRequest,
  Ingredient,
  UpdateIngredientRequest
} from '../../../models/admin-menu.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface EditState {
  id: number;
  name: string;
  description: string;
}

@Component({
  selector: 'app-admin-ingredients-modal',
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-ingredients-modal.html',
  styleUrl: './admin-ingredients-modal.css'
})
export class AdminIngredientsModal {

  readonly isOpen = input(false);
  readonly ingredients = input<Ingredient[]>([]);
  readonly isLoading = input(false);

  readonly create = output<CreateIngredientRequest>();
  readonly update = output<{ id: number; request: UpdateIngredientRequest }>();
  readonly delete = output<number>();
  readonly searchChange = output<string>();
  readonly close = output<void>();

  readonly showAddForm = signal(false);
  readonly newName = signal('');
  readonly newDescription = signal('');
  readonly isAddSubmitting = signal(false);

  readonly editState = signal<EditState | null>(null);
  readonly isSavingEdit = signal(false);

  readonly searchText = signal('');

  // ─── Validation ─────────────────────────────────────────────────────────────

  readonly isNewValid = () =>
    this.newName().trim().length > 0 && this.newName().trim().length <= 100;

  readonly isEditValid = () => {
    const s = this.editState();
    return s !== null && s.name.trim().length > 0 && s.name.trim().length <= 100;
  };

  // ─── Add ────────────────────────────────────────────────────────────────────

  openAddForm(): void {
    this.showAddForm.set(true);
    this.newName.set('');
    this.newDescription.set('');
  }

  cancelAdd(): void {
    this.showAddForm.set(false);
  }

  submitAdd(): void {
    if (!this.isNewValid()) return;
    this.isAddSubmitting.set(true);
    this.create.emit({
      name: this.newName().trim(),
      description: this.newDescription().trim() || null
    });
  }

  resetAddSubmitting(): void {
    this.isAddSubmitting.set(false);
    this.showAddForm.set(false);
    this.newName.set('');
    this.newDescription.set('');
  }

  // ─── Edit ────────────────────────────────────────────────────────────────────

  startEdit(ingredient: Ingredient): void {
    this.editState.set({
      id: ingredient.id,
      name: ingredient.name,
      description: ingredient.description ?? ''
    });
  }

  cancelEdit(): void {
    this.editState.set(null);
  }

  submitEdit(): void {
    const state = this.editState();
    if (!state || !this.isEditValid()) return;
    this.isSavingEdit.set(true);
    this.update.emit({
      id: state.id,
      request: {
        name: state.name.trim(),
        description: state.description.trim() || null
      }
    });
  }

  resetEditSubmitting(): void {
    this.isSavingEdit.set(false);
    this.editState.set(null);
  }

  updateEditField(field: 'name' | 'description', value: string): void {
    this.editState.update(s => s ? { ...s, [field]: value } : s);
  }

  // ─── Delete ──────────────────────────────────────────────────────────────────

  onDelete(id: number): void {
    if (!confirm('Delete this ingredient? It must not be in use by any menu item.')) return;
    this.delete.emit(id);
  }

  // ─── Search ──────────────────────────────────────────────────────────────────

  onSearch(value: string): void {
    this.searchText.set(value);
    this.searchChange.emit(value);
  }

  // ─── Close ───────────────────────────────────────────────────────────────────

  onClose(): void {
    this.showAddForm.set(false);
    this.editState.set(null);
    this.searchText.set('');
    this.close.emit();
  }

  isEditing(id: number): boolean {
    return this.editState()?.id === id;
  }
}
