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
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
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

  readonly menuItems   = signal<AdminMenuItem[]>([]);
  readonly categories  = signal<AdminMenuCategory[]>([]);
  readonly isLoading   = signal(false);

  readonly selectedCategoryId  = signal<number | undefined>(undefined);
  readonly selectedAvailability = signal<boolean | undefined>(undefined);
  readonly selectedFoodType    = signal<FoodType | undefined>(undefined);
  readonly searchText          = signal('');

  readonly selectedMenu      = signal<AdminMenuItem | null>(null);
  readonly showMenuModal     = signal(false);
  readonly showEditMenuModal = signal(false);
  readonly showCategoryModal = signal(false);

  private readonly searchInput$ = new Subject<string>();
  private searchSub?: Subscription;

  private readonly fetch$ = new Subject<MenuSearchParams>();
  private fetchSub?: Subscription;

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
      search:     this.searchText().trim() || undefined,
      categoryId: this.selectedCategoryId(),
      isAvailable: this.selectedAvailability(),
      foodType:   this.selectedFoodType()
    };
    this.fetch$.next(params);
  }

  reload(): void {
    this.fetchMenuItems();
  }

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


  openManageCategories(): void { this.showCategoryModal.set(true); }
  closeCategoryModal(): void   { this.showCategoryModal.set(false); }


  saveMenu(data: { request: CreateMenuItemRequest; image: File | null }): void {
    this.adminMenuService.createMenuItem(data.request, data.image).subscribe({
      next: () => {
        this.closeMenuModal();
        this.notificationService.success('Menu item added.');
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
        this.notificationService.success('Menu item updated.');
        this.reload();
      },
      error: () => {
        this.editModal?.resetSubmitting();
        this.notificationService.error('Failed to update menu item.');
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
      next: () => {
        this.loadCategories();
        this.reload();
      },
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
      error: () => this.notificationService.error('Failed to delete category.')
    });
  }
}
