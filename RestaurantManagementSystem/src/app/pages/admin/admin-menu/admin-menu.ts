import { Component, inject, OnInit, OnDestroy, signal, ViewChild } from '@angular/core';
import {
  AdminMenuCategory,
  AdminMenuItem,
  CreateCategoryRequest,
  FoodType,
  MenuSearchParams,
  SaveCategoryRequest,
  UpdateMenuAvailabilityRequest,
  UpdateMenuItemRequest,
  CreateMenuItemRequest
} from '../../../models/admin-menu.model';
import { CommonModule } from '@angular/common';
import { AdminMenu as AdminMenuService } from '../../../services/admin/admin-menu';
import { AdminMenuCard } from '../../../components/admin/admin-menu-card/admin-menu-card';
import { AdminMenuModal } from '../../../components/admin/admin-menu-modal/admin-menu-modal';
import { AdminMenuEditModal } from '../../../components/admin/admin-menu-edit-modal/admin-menu-edit-modal';
import { AdminCategoryModal } from '../../../components/admin/admin-category-modal/admin-category-modal';
import { BehaviorSubject, combineLatest, of, Subscription, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, catchError } from 'rxjs/operators';
import { NotificationServices } from '../../../services/notification-services';

@Component({
  selector: 'app-admin-menu',
  imports: [CommonModule, AdminMenuCard, AdminMenuModal, AdminMenuEditModal, AdminCategoryModal],
  templateUrl: './admin-menu.html',
  styleUrl: './admin-menu.css',
})
export class AdminMenu implements OnInit, OnDestroy {

  private readonly adminMenuService = inject(AdminMenuService);
  private readonly notificationService = inject(NotificationServices);

  @ViewChild(AdminMenuModal) menuModal?: AdminMenuModal;
  @ViewChild(AdminMenuEditModal) editModal?: AdminMenuEditModal;

  readonly FoodType = FoodType;

  readonly menuItems = signal<AdminMenuItem[]>([]);
  readonly categories = signal<AdminMenuCategory[]>([]);

  readonly selectedCategoryId = signal<number | undefined>(undefined);
  readonly selectedAvailability = signal<boolean | undefined>(undefined);
  readonly selectedFoodType = signal<FoodType | undefined>(undefined);
  readonly search = signal('');

  readonly selectedMenu = signal<AdminMenuItem | null>(null);

  readonly showMenuModal = signal(false);
  readonly showEditMenuModal = signal(false);
  readonly showCategoryModal = signal(false);

  readonly isLoading = signal(false);

  // ── RxJS filter streams ───────────────────────────────────────────────────

  private readonly search$ = new BehaviorSubject<string>('');
  private readonly categoryId$ = new BehaviorSubject<number | undefined>(undefined);
  private readonly isAvailable$ = new BehaviorSubject<boolean | undefined>(undefined);
  private readonly foodType$ = new BehaviorSubject<FoodType | undefined>(undefined);
  // Use a Subject here so the pipeline only fires when we explicitly call reload()
  private readonly reload$ = new Subject<void>();
  private filterSubscription?: Subscription;
  private searchSubscription?: Subscription;

  ngOnInit(): void {
    this.loadCategories();
    this.setupFilterPipeline();
    // Set up debounced search: trigger reload only after user stops typing.
    this.searchSubscription = this.search$.pipe(distinctUntilChanged(), debounceTime(2000)).subscribe(() => this.reload());

    // Trigger an initial load once after the pipeline is set up (no debounce)
    this.reload();
  }

  ngOnDestroy(): void {
    this.filterSubscription?.unsubscribe();
    this.searchSubscription?.unsubscribe();
  }

  // ── Filter pipeline ───────────────────────────────────────────────────────

  private setupFilterPipeline(): void {
    // Combine filters (excluding search) with explicit reload triggers.
    this.filterSubscription = combineLatest([
      this.categoryId$,
      this.isAvailable$,
      this.foodType$,
      this.reload$
    ]).pipe(
      switchMap(([categoryId, isAvailable, foodType]) => {
        this.isLoading.set(true);
        const search = this.search().trim();
        const params: MenuSearchParams = {
          search: search || undefined,
          categoryId,
          isAvailable,
          foodType
        };
        return this.adminMenuService.getMenuItems(params).pipe(
          catchError(() => {
            this.notificationService.error('Failed to load menu items.');
            return of([]);
          })
        );
      })
    ).subscribe({
      next: items => {
        this.menuItems.set(items);
        this.isLoading.set(false);
      }
    });
  }

  // single reload — only changes reload$ so combineLatest fires exactly once
  reload(): void {
    this.reload$.next();
  }

  loadCategories(): void {
    this.adminMenuService.getCategories().subscribe({
      next: categories => this.categories.set(categories)
    });
  }

  // ── Filters ───────────────────────────────────────────────────────────────

  filterByCategory(categoryId?: number): void {
    this.selectedCategoryId.set(categoryId);
    this.categoryId$.next(categoryId);
  }

  filterByAvailability(isAvailable?: boolean): void {
    this.selectedAvailability.set(isAvailable);
    this.isAvailable$.next(isAvailable);
  }

  filterByFoodType(foodType?: FoodType): void {
    this.selectedFoodType.set(foodType);
    this.foodType$.next(foodType);
  }

  searchMenu(search: string): void {
    this.search.set(search);
    this.search$.next(search);
  }

  // ── Menu modal ────────────────────────────────────────────────────────────

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

  // ── Category modal ────────────────────────────────────────────────────────

  openManageCategories(): void {
    this.showCategoryModal.set(true);
  }

  closeCategoryModal(): void {
    this.showCategoryModal.set(false);
  }

  // ── Menu CRUD ─────────────────────────────────────────────────────────────

  saveMenu(data: { request: CreateMenuItemRequest; image: File | null }): void {
    this.adminMenuService.createMenuItem(data.request, data.image).subscribe({
      next: () => {
        this.closeMenuModal();
        this.notificationService.success('Menu item added successfully!');
        this.reload();
      },
      error: () => {
        this.menuModal?.resetSubmitting();
        this.notificationService.error('Failed to create menu item.');
      }
    });
  }

  updateMenu(data: { request: UpdateMenuItemRequest; image: File | null }): void {
    const current = this.selectedMenu();
    if (!current) return;
    this.adminMenuService.updateMenuItem(current.id, data.request, data.image).subscribe({
      next: () => {
        this.closeMenuModal();
        this.notificationService.success('Menu item updated successfully!');
        this.reload();
      },
      error: () => {
        this.editModal?.resetSubmitting();
        this.notificationService.error('Failed to update menu item.');
      }
    });
  }

  deleteMenu(id: number): void {
    this.adminMenuService.deleteMenuItem(id).subscribe({
      next: () => {
        this.notificationService.success('Menu item deleted.');
        this.reload();
      },
      error: () => this.notificationService.error('Failed to delete menu item.')
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

  // ── Category CRUD ─────────────────────────────────────────────────────────

  saveCategory(request: SaveCategoryRequest): void {
    const r = request as any;
    if ('id' in r && r.id) {
      this.adminMenuService.updateCategory(r.id, { name: r.name, description: r.description }).subscribe({
        next: () => {
          this.notificationService.success('Category updated.');
          this.loadCategories();
        },
        error: () => this.notificationService.error('Failed to update category.')
      });
    } else {
      this.adminMenuService.createCategory(request as CreateCategoryRequest).subscribe({
        next: () => {
          this.notificationService.success('Category created.');
          this.loadCategories();
        },
        error: () => this.notificationService.error('Failed to create category.')
      });
    }
  }

  toggleCategoryAvailability(id: number, isAvailable: boolean): void {
    this.adminMenuService.updateCategoryAvailability(id, isAvailable).subscribe({
      next: () => this.loadCategories(),
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
      },
      error: () => this.notificationService.error('Failed to delete category.')
    });
  }
}
