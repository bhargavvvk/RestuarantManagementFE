import { Component, inject, OnInit, OnDestroy, signal, ViewChild } from '@angular/core';
import {
  AdminMenuCategory,
  AdminMenuItem,
  CreateCategoryRequest,
  CreateIngredientRequest,
  FoodType,
  Ingredient,
  MenuItemIngredient,
  MenuItemNutrition,
  MenuSearchParams,
  SaveCategoryRequest,
  UpdateIngredientRequest,
  UpdateMenuAvailabilityRequest,
  UpdateMenuItemIngredientsRequest,
  UpdateMenuItemRequest,
  UpsertNutritionRequest,
  CreateMenuItemRequest
} from '../../../models/admin-menu.model';
import { CommonModule } from '@angular/common';
import { AdminMenu as AdminMenuService } from '../../../services/admin/admin-menu';
import { AdminMenuCard } from '../../../components/admin/admin-menu-card/admin-menu-card';
import { AdminMenuModal } from '../../../components/admin/admin-menu-modal/admin-menu-modal';
import { AdminMenuEditModal } from '../../../components/admin/admin-menu-edit-modal/admin-menu-edit-modal';
import { AdminCategoryModal } from '../../../components/admin/admin-category-modal/admin-category-modal';
import { AdminIngredientsModal } from '../../../components/admin/admin-ingredients-modal/admin-ingredients-modal';
import { AdminMenuIngredientsModal } from '../../../components/admin/admin-menu-ingredients-modal/admin-menu-ingredients-modal';
import { AdminMenuNutritionModal } from '../../../components/admin/admin-menu-nutrition-modal/admin-menu-nutrition-modal';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { NotificationServices } from '../../../services/notification-services';

@Component({
  selector: 'app-admin-menu',
  imports: [
    CommonModule,
    AdminMenuCard,
    AdminMenuModal,
    AdminMenuEditModal,
    AdminCategoryModal,
    AdminIngredientsModal,
    AdminMenuIngredientsModal,
    AdminMenuNutritionModal
  ],
  templateUrl: './admin-menu.html',
  styleUrl: './admin-menu.css',
})
export class AdminMenu implements OnInit, OnDestroy {

  private readonly adminMenuService  = inject(AdminMenuService);
  private readonly notificationService = inject(NotificationServices);

  @ViewChild(AdminMenuModal) menuModal?: AdminMenuModal;
  @ViewChild(AdminMenuEditModal) editModal?: AdminMenuEditModal;
  @ViewChild(AdminIngredientsModal) ingredientsLibraryModal?: AdminIngredientsModal;

  readonly FoodType = FoodType;

  // ─── Menu list ───────────────────────────────────────────────────────────────
  readonly menuItems  = signal<AdminMenuItem[]>([]);
  readonly categories = signal<AdminMenuCategory[]>([]);
  readonly isLoading  = signal(false);

  readonly selectedCategoryId   = signal<number | undefined>(undefined);
  readonly selectedAvailability = signal<boolean | undefined>(undefined);
  readonly selectedFoodType     = signal<FoodType | undefined>(undefined);
  readonly searchText           = signal('');

  readonly selectedMenu      = signal<AdminMenuItem | null>(null);
  readonly showMenuModal     = signal(false);
  readonly showEditMenuModal = signal(false);
  readonly showCategoryModal = signal(false);

  private readonly searchInput$ = new Subject<string>();
  private searchSub?: Subscription;

  private readonly fetch$ = new Subject<MenuSearchParams>();
  private fetchSub?: Subscription;

  // ─── Ingredient library ──────────────────────────────────────────────────────
  readonly showIngredientsLibraryModal = signal(false);
  readonly ingredientLibrary           = signal<Ingredient[]>([]);
  readonly isLoadingLibrary            = signal(false);

  // ─── Per-item ingredients ────────────────────────────────────────────────────
  readonly showMenuItemIngredientsModal = signal(false);
  readonly selectedMenuItemForIngredients = signal<AdminMenuItem | null>(null);
  readonly menuItemIngredients          = signal<MenuItemIngredient[]>([]);
  readonly isLoadingItemIngredients     = signal(false);
  readonly isSavingItemIngredients      = signal(false);

  // ─── Per-item nutrition ───────────────────────────────────────────────────────
  readonly showNutritionModal       = signal(false);
  readonly selectedMenuItemForNutrition = signal<AdminMenuItem | null>(null);
  readonly menuItemNutrition        = signal<MenuItemNutrition | null>(null);
  readonly isLoadingNutrition       = signal(false);
  readonly isSavingNutrition        = signal(false);

  // ─── Lifecycle ───────────────────────────────────────────────────────────────

  ngOnInit(): void {
    this.loadCategories();
    this.setupFetchPipeline();
    this.setupSearchDebounce();
    this.fetchMenuItems();
  }

  ngOnDestroy(): void {
    this.fetchSub?.unsubscribe();
    this.searchSub?.unsubscribe();
  }

  // ─── Menu list ───────────────────────────────────────────────────────────────

  private setupFetchPipeline(): void {
    this.fetchSub = this.fetch$.pipe(
      switchMap(params => {
        this.isLoading.set(true);
        return this.adminMenuService.getMenuItems(params).pipe(
          catchError(() => {
            this.notificationService.error('Failed to load menu items.');
            return of([]);
          })
        );
      })
    ).subscribe(items => {
      this.menuItems.set(items);
      this.isLoading.set(false);
    });
  }

  private setupSearchDebounce(): void {
    this.searchSub = this.searchInput$.pipe(
      debounceTime(1000),
      distinctUntilChanged()
    ).subscribe(() => this.fetchMenuItems());
  }

  private fetchMenuItems(): void {
    const params: MenuSearchParams = {
      search:      this.searchText().trim() || undefined,
      categoryId:  this.selectedCategoryId(),
      isAvailable: this.selectedAvailability(),
      foodType:    this.selectedFoodType()
    };
    this.fetch$.next(params);
  }

  reload(): void { this.fetchMenuItems(); }

  loadCategories(): void {
    this.adminMenuService.getCategories().subscribe({
      next: cats => this.categories.set(cats)
    });
  }

  filterByCategory(categoryId?: number): void {
    this.selectedCategoryId.set(categoryId);
    this.fetchMenuItems();
  }

  filterByAvailability(isAvailable?: boolean): void {
    this.selectedAvailability.set(isAvailable);
    this.fetchMenuItems();
  }

  filterByFoodType(foodType?: FoodType): void {
    this.selectedFoodType.set(foodType);
    this.fetchMenuItems();
  }

  searchMenu(value: string): void {
    this.searchText.set(value);
    this.searchInput$.next(value);
  }

  // ─── Add / Edit menu item ────────────────────────────────────────────────────

  openAddMenu(): void {
    this.selectedMenu.set(null);
    this.showMenuModal.set(true);
  }

  editMenu(menu: AdminMenuItem): void {
    this.selectedMenu.set(menu);
    this.showEditMenuModal.set(true);
  }

  closeMenuModal(): void {
    this.showMenuModal.set(false);
    this.showEditMenuModal.set(false);
    this.selectedMenu.set(null);
  }

  saveMenu(data: { request: CreateMenuItemRequest; image: File | null }): void {
    this.adminMenuService.createMenuItem(data.request, data.image).subscribe({
      next: () => {
        this.closeMenuModal();
        this.notificationService.success('Menu item added.');
        this.reload();
      },
      error: (err) => {
        this.menuModal?.resetSubmitting();
        this.notificationService.error(err?.error?.message ?? 'Failed to create menu item.');
      }
    });
  }

  updateMenu(data: { request: UpdateMenuItemRequest; image: File | null }): void {
    const current = this.selectedMenu();
    if (!current) return;
    this.adminMenuService.updateMenuItem(current.id, data.request, data.image).subscribe({
      next: () => {
        this.closeMenuModal();
        this.notificationService.success('Menu item updated.');
        this.reload();
      },
      error: (err) => {
        this.editModal?.resetSubmitting();
        this.notificationService.error(err?.error?.message ?? 'Failed to update menu item.');
      }
    });
  }

  deleteMenu(id: number): void {
    if (!confirm('Delete this menu item? This cannot be undone.')) return;
    this.adminMenuService.deleteMenuItem(id).subscribe({
      next: () => {
        this.notificationService.success('Menu item deleted.');
        this.reload();
      },
      error: (err) => this.notificationService.error(err?.error?.message ?? 'Failed to delete menu item.')
    });
  }

  updateAvailability(id: number, request: UpdateMenuAvailabilityRequest): void {
    this.adminMenuService.updateAvailability(id, request).subscribe({
      next: () => this.reload(),
      error: () => {
        this.notificationService.error('Failed to update availability.');
        this.reload();
      }
    });
  }

  // ─── Categories ──────────────────────────────────────────────────────────────

  openManageCategories(): void { this.showCategoryModal.set(true); }
  closeCategoryModal(): void   { this.showCategoryModal.set(false); }

  saveCategory(request: SaveCategoryRequest): void {
    const r = request as any;
    if ('id' in r && r.id) {
      this.adminMenuService.updateCategory(r.id, { name: r.name, description: r.description }).subscribe({
        next: () => {
          this.notificationService.success('Category updated.');
          this.loadCategories();
        },
        error: (err) => this.notificationService.error(err?.error?.message ?? 'Failed to update category.')
      });
    } else {
      this.adminMenuService.createCategory(request as CreateCategoryRequest).subscribe({
        next: () => {
          this.notificationService.success('Category created.');
          this.loadCategories();
        },
        error: (err) => this.notificationService.error(err?.error?.message ?? 'Failed to create category.')
      });
    }
  }

  toggleCategoryAvailability(id: number, isAvailable: boolean): void {
    this.adminMenuService.updateCategoryAvailability(id, isAvailable).subscribe({
      next: () => { this.loadCategories(); this.reload(); },
      error: () => {
        this.notificationService.error('Failed to update category availability.');
        this.loadCategories();
      }
    });
  }

  deleteCategory(id: number): void {
    this.adminMenuService.deleteCategory(id).subscribe({
      next: () => {
        this.notificationService.success('Category deleted.');
        this.loadCategories();
        this.reload();
      },
      error: (err) => this.notificationService.error(err?.error?.message ?? 'Failed to delete category.')
    });
  }

  // ─── Ingredient library ──────────────────────────────────────────────────────

  openIngredientsLibrary(): void {
    this.showIngredientsLibraryModal.set(true);
    this.loadIngredientLibrary();
  }

  closeIngredientsLibrary(): void {
    this.showIngredientsLibraryModal.set(false);
  }

  loadIngredientLibrary(search?: string): void {
    this.isLoadingLibrary.set(true);
    this.adminMenuService.getIngredients(search).subscribe({
      next: (list) => {
        this.ingredientLibrary.set(list);
        this.isLoadingLibrary.set(false);
      },
      error: (err) => {
        this.notificationService.error(err?.error?.message ?? 'Failed to load ingredients.');
        this.isLoadingLibrary.set(false);
      }
    });
  }

  createIngredient(request: CreateIngredientRequest): void {
    this.adminMenuService.createIngredient(request).subscribe({
      next: () => {
        this.ingredientsLibraryModal?.resetAddSubmitting();
        this.notificationService.success('Ingredient created.');
        this.loadIngredientLibrary();
      },
      error: (err) => {
        this.ingredientsLibraryModal?.resetAddSubmitting();
        this.notificationService.error(err?.error?.message ?? 'Failed to create ingredient.');
      }
    });
  }

  updateIngredient(event: { id: number; request: UpdateIngredientRequest }): void {
    this.adminMenuService.updateIngredient(event.id, event.request).subscribe({
      next: () => {
        this.ingredientsLibraryModal?.resetEditSubmitting();
        this.notificationService.success('Ingredient updated.');
        this.loadIngredientLibrary();
      },
      error: (err) => {
        this.ingredientsLibraryModal?.resetEditSubmitting();
        this.notificationService.error(err?.error?.message ?? 'Failed to update ingredient.');
      }
    });
  }

  deleteIngredient(id: number): void {
    this.adminMenuService.deleteIngredient(id).subscribe({
      next: () => {
        this.notificationService.success('Ingredient deleted.');
        this.loadIngredientLibrary();
      },
      error: (err) => this.notificationService.error(err?.error?.message ?? 'Failed to delete ingredient. Make sure it is not in use by any menu item.')
    });
  }

  // ─── Per-item ingredients ────────────────────────────────────────────────────

  openMenuItemIngredients(item: AdminMenuItem): void {
    this.selectedMenuItemForIngredients.set(item);
    this.showMenuItemIngredientsModal.set(true);
    this.menuItemIngredients.set([]);
    // load library if not already loaded
    if (this.ingredientLibrary().length === 0) {
      this.loadIngredientLibrary();
    }
    this.isLoadingItemIngredients.set(true);
    this.adminMenuService.getMenuItemIngredients(item.id).subscribe({
      next: (list) => {
        this.menuItemIngredients.set(list);
        this.isLoadingItemIngredients.set(false);
      },
      error: (err) => {
        this.notificationService.error(err?.error?.message ?? 'Failed to load ingredients.');
        this.isLoadingItemIngredients.set(false);
      }
    });
  }

  closeMenuItemIngredients(): void {
    this.showMenuItemIngredientsModal.set(false);
    this.selectedMenuItemForIngredients.set(null);
    this.menuItemIngredients.set([]);
  }

  saveMenuItemIngredients(request: UpdateMenuItemIngredientsRequest): void {
    const item = this.selectedMenuItemForIngredients();
    if (!item) return;
    this.isSavingItemIngredients.set(true);
    this.adminMenuService.updateMenuItemIngredients(item.id, request).subscribe({
      next: (list) => {
        this.menuItemIngredients.set(list);
        this.isSavingItemIngredients.set(false);
        this.notificationService.success('Ingredients saved.');
        this.closeMenuItemIngredients();
      },
      error: (err) => {
        this.isSavingItemIngredients.set(false);
        this.notificationService.error(err?.error?.message ?? 'Failed to save ingredients.');
      }
    });
  }

  // ─── Per-item nutrition ───────────────────────────────────────────────────────

  openMenuItemNutrition(item: AdminMenuItem): void {
    this.selectedMenuItemForNutrition.set(item);
    this.showNutritionModal.set(true);
    this.menuItemNutrition.set(null);
    this.isLoadingNutrition.set(true);
    this.adminMenuService.getMenuItemNutrition(item.id).subscribe({
      next: (n) => {
        this.menuItemNutrition.set(n);
        this.isLoadingNutrition.set(false);
      },
      error: (err) => {
        // 404 means no nutrition set yet — not an error state
        if (err?.status === 404) {
          this.menuItemNutrition.set(null);
        } else {
          this.notificationService.error(err?.error?.message ?? 'Failed to load nutrition info.');
        }
        this.isLoadingNutrition.set(false);
      }
    });
  }

  closeNutritionModal(): void {
    this.showNutritionModal.set(false);
    this.selectedMenuItemForNutrition.set(null);
    this.menuItemNutrition.set(null);
  }

  saveNutrition(request: UpsertNutritionRequest): void {
    const item = this.selectedMenuItemForNutrition();
    if (!item) return;
    this.isSavingNutrition.set(true);
    this.adminMenuService.upsertMenuItemNutrition(item.id, request).subscribe({
      next: (n) => {
        this.menuItemNutrition.set(n);
        this.isSavingNutrition.set(false);
        this.notificationService.success('Nutrition info saved.');
        this.closeNutritionModal();
      },
      error: (err) => {
        this.isSavingNutrition.set(false);
        this.notificationService.error(err?.error?.message ?? 'Failed to save nutrition info.');
      }
    });
  }

  deleteNutrition(): void {
    const item = this.selectedMenuItemForNutrition();
    if (!item) return;
    this.adminMenuService.deleteMenuItemNutrition(item.id).subscribe({
      next: () => {
        this.notificationService.success('Nutrition info removed.');
        this.closeNutritionModal();
      },
      error: (err) => this.notificationService.error(err?.error?.message ?? 'Failed to remove nutrition info.')
    });
  }
}
