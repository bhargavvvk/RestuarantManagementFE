import { Component, effect, input, output, signal } from '@angular/core';
import {
  MenuItemNutrition,
  UpsertNutritionRequest
} from '../../../models/admin-menu.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface NutritionForm {
  calories: string;
  protein: string;
  carbohydrates: string;
  fat: string;
  fiber: string;
  sugar: string;
  sodium: string;
}

const FIELDS: { key: keyof NutritionForm; label: string; unit: string }[] = [
  { key: 'calories',      label: 'Calories',      unit: 'kcal' },
  { key: 'protein',       label: 'Protein',        unit: 'g'    },
  { key: 'carbohydrates', label: 'Carbohydrates',  unit: 'g'    },
  { key: 'fat',           label: 'Fat',            unit: 'g'    },
  { key: 'fiber',         label: 'Fiber',          unit: 'g'    },
  { key: 'sugar',         label: 'Sugar',          unit: 'g'    },
  { key: 'sodium',        label: 'Sodium',         unit: 'mg'   },
];

function toStr(v: number | null | undefined): string {
  return v != null ? String(v) : '';
}

function blankForm(): NutritionForm {
  return { calories: '', protein: '', carbohydrates: '', fat: '', fiber: '', sugar: '', sodium: '' };
}

@Component({
  selector: 'app-admin-menu-nutrition-modal',
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-menu-nutrition-modal.html',
  styleUrl: './admin-menu-nutrition-modal.css'
})
export class AdminMenuNutritionModal {

  readonly isOpen        = input(false);
  readonly menuItemName  = input('');
  readonly nutrition     = input<MenuItemNutrition | null>(null);
  readonly isLoading     = input(false);
  readonly isSaving      = input(false);

  readonly save   = output<UpsertNutritionRequest>();
  readonly close  = output<void>();

  readonly fields = FIELDS;
  readonly form   = signal<NutritionForm>(blankForm());

  constructor() {
    effect(() => {
      // Re-sync whenever the drawer is open AND nutrition data changes.
      // This handles the async case where nutrition arrives after the drawer opens.
      const open = this.isOpen();
      const n = this.nutrition(); // read inside effect so it re-runs when data arrives

      if (open) {
        if (n) {
          this.form.set({
            calories:      toStr(n.calories),
            protein:       toStr(n.protein),
            carbohydrates: toStr(n.carbohydrates),
            fat:           toStr(n.fat),
            fiber:         toStr(n.fiber),
            sugar:         toStr(n.sugar),
            sodium:        toStr(n.sodium)
          });
        } else {
          this.form.set(blankForm());
        }
      }
    });
  }


  updateField(key: keyof NutritionForm, value: string | number | null): void {
    // number inputs emit numbers; coerce to string so trim() always works
    const str = value == null ? '' : String(value);
    this.form.update(f => ({ ...f, [key]: str }));
  }

  // ─── Validation ──────────────────────────────────────────────────────────────

  readonly fieldErrors = (): Map<keyof NutritionForm, string> => {
    const errors = new Map<keyof NutritionForm, string>();
    const f = this.form();
    for (const field of FIELDS) {
      const raw = String(f[field.key] ?? '').trim();
      if (raw === '') continue; // blank = omit (null)
      const num = Number(raw);
      if (isNaN(num) || num < 0) {
        errors.set(field.key, 'Must be a number ≥ 0.');
      }
    }
    return errors;
  };

  readonly isValid = () => this.fieldErrors().size === 0;

  readonly hasAnyValue = () =>
    Object.values(this.form()).some(v => String(v ?? '').trim() !== '');

  // ─── Save ────────────────────────────────────────────────────────────────────

  onSave(): void {
    if (!this.isValid()) return;
    const f = this.form();
    const req: UpsertNutritionRequest = {};
    for (const field of FIELDS) {
      const raw = String(f[field.key] ?? '').trim();
      (req as any)[field.key] = raw !== '' ? Number(raw) : null;
    }
    this.save.emit(req);
  }

  onRemove(): void {
    if (!confirm('Clear all nutrition values for this item?')) return;
    // Upsert with all fields null — keeps the record but clears all values
    const req: UpsertNutritionRequest = {
      calories: null,
      protein: null,
      carbohydrates: null,
      fat: null,
      fiber: null,
      sugar: null,
      sodium: null
    };
    this.save.emit(req);
  }

  onClose(): void {
    this.form.set(blankForm());
    this.close.emit();
  }
}
