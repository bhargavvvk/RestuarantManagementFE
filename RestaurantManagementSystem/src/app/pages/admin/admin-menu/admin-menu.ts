import { Component, inject, OnInit, OnDestroy, signal } from '@angular/core';
import {
  AdminMenuCategory,
  AdminMenuItem,
  CreateCategoryRequest,
  MenuSearchParams,
  SaveCategoryRequest,
  UpdateMenuAvailabilityRequest,
  UpdateMenuItemRequest,
  CreateMenuItemRequest
} from '../../../models/admin-menu.model';
import { CommonModule } from '@angular/common';
import { AdminMenu as AdminMenuService } from '../../../services/admin/admin-menu';
import { AdminMenuCard } from "../../../components/admin/admin-menu-card/admin-menu-card";
import { AdminMenuModal } from "../../../components/admin/admin-menu-modal/admin-menu-modal";
import { AdminMenuEditModal } from "../../../components/admin/admin-menu-edit-modal/admin-menu-edit-modal";
import { AdminCategoryModal } from "../../../components/admin/admin-category-modal/admin-category-modal";
import { BehaviorSubject, combineLatest, of, Subscription } from 'rxjs';
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

  readonly menuItems = signal<AdminMenuItem[]>([]);
  readonly categories = signal<AdminMenuCategory[]>([]);

  readonly selectedCategoryId = signal<number | undefined>(undefined);
  readonly selectedAvailability = signal<boolean | undefined>(undefined);
  readonly search = signal('');

  readonly selectedMenu = signal<AdminMenuItem | null>(null);

  readonly showMenuModal = signal(false);
  readonly showEditMenuModal = signal(false);
  readonly showCategoryModal = signal(false);

  readonly isLoading = signal(false);

  // ── RxJS streams for filtering ───────────────────────────────────────────

  private readonly search$ = new BehaviorSubject<string>('');
  private readonly categoryId$ = new BehaviorSubject<number | undefined>(undefined);
  private readonly isAvailable$ = new BehaviorSubject<boolean | undefined>(undefined);
  private filterSubscription?: Subscription;

  ngOnInit(): void {
    this.loadCategories();
    this.setupFilterPipeline();
  }

  ngOnDestroy(): void {
    if (this.filterSubscription) {
      this.filterSubscription.unsubscribe();
    }
  }

  // ── Filter pipeline setup ────────────────────────────────────────────────

  private setupFilterPipeline(): void {
    const debouncedSearch$ = this.search$.pipe(
      debounceTime(300),
      distinctUntilChanged()
    );

    this.filterSubscription = combineLatest([
      debouncedSearch$,
      this.categoryId$,
      this.isAvailable$
    ]).pipe(
      switchMap(([search, categoryId, isAvailable]) => {
        this.isLoading.set(true);
        const params: MenuSearchParams = {
          search: search || undefined,
          categoryId: categoryId,
          isAvailable: isAvailable
        };
        return this.adminMenuService.getMenuItems(params).pipe(
          catchError(() => {
            this.showNotification('Failed to load menu items.', 'error');
            return of([]);
          })
        );
      })
    ).subscribe({
      next: items => {
        this.menuItems.set(items);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }

  // ── Data loading ─────────────────────────────────────────────────────────

  loadMenuItems(): void {
    this.search$.next(this.search());
    this.categoryId$.next(this.selectedCategoryId());
    this.isAvailable$.next(this.selectedAvailability());
  }

  loadCategories(): void {

    this.adminMenuService.getCategories().subscribe({
      next: categories => this.categories.set(categories)
    });

  }

  // ── Filtering ────────────────────────────────────────────────────────────

  filterByCategory(categoryId?: number): void {
    this.selectedCategoryId.set(categoryId);
    this.categoryId$.next(categoryId);
  }

  filterByAvailability(isAvailable?: boolean): void {
    this.selectedAvailability.set(isAvailable);
    this.isAvailable$.next(isAvailable);
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

    // Create new item
    this.adminMenuService
      .createMenuItem(data.request)
      .subscribe({

        next: created => {
          this.menuItems.update(items => [...items, created]);
          this.closeMenuModal();
          this.showNotification('Menu item added successfully!', 'success');
        },

        error: () => {
          this.showNotification('Failed to create menu item.', 'error');
        }

      });

  }

  updateMenu(data: { request: UpdateMenuItemRequest }): void {

    const currentItem = this.selectedMenu();
    if (!currentItem) return;

    // Update existing item
    this.adminMenuService
      .updateMenuItem(currentItem.id, data.request)
      .subscribe({

        next: updated => {
          this.menuItems.update(items =>
            items.map(i => i.id === updated.id ? updated : i)
          );
          this.closeMenuModal();
          this.showNotification('Menu item updated successfully!', 'success');
        },

        error: () => {
          this.showNotification('Failed to update menu item.', 'error');
        }

      });

  }

  deleteMenu(id: number): void {

    if (!confirm('Are you sure you want to delete this menu item?')) {
      return;
    }

    this.adminMenuService.deleteMenuItem(id).subscribe({

      next: () => {
        this.menuItems.update(items => items.filter(i => i.id !== id));
        this.showNotification('Menu item deleted.', 'success');
      },

      error: () => {
        this.showNotification('Failed to delete menu item.', 'error');
      }

    });

  }

  updateAvailability(id: number, request: UpdateMenuAvailabilityRequest): void {

    this.adminMenuService.updateAvailability(id, request).subscribe({

      next: updated => {
        this.menuItems.update(items =>
          items.map(i => i.id === updated.id ? updated : i)
        );
      },

      error: () => {
        // Revert optimistic toggle by reloading
        this.loadMenuItems();
        this.showNotification('Failed to update availability.', 'error');
      }

    });

  }

  // ── Category CRUD ─────────────────────────────────────────────────────────

  saveCategory(request: SaveCategoryRequest): void {

    const r = request as any;

    if ('id' in r && r.id) {

      this.adminMenuService
        .updateCategory(r.id, { name: r.name, description: r.description })
        .subscribe({

          next: updated => {
            this.categories.update(cats =>
              cats.map(c => c.id === updated.id ? updated : c)
            );
            this.showNotification('Category updated.', 'success');
          },

          error: () => {
            this.showNotification('Failed to update category.', 'error');
          }

        });

    } else {

      this.adminMenuService.createCategory(request as CreateCategoryRequest).subscribe({

        next: created => {
          this.categories.update(cats => [...cats, created]);
          this.showNotification('Category created.', 'success');
        },

        error: () => {
          this.showNotification('Failed to create category.', 'error');
        }

      });

    }

  }

  toggleCategoryAvailability(id: number, isAvailable: boolean): void {

    this.adminMenuService.updateCategoryAvailability(id, isAvailable).subscribe({

      next: updated => {
        this.categories.update(cats =>
          cats.map(c => c.id === updated.id ? updated : c)
        );
      },

      error: () => {
        this.showNotification('Failed to update category availability.', 'error');
        this.loadCategories();
      }

    });

  }

  deleteCategory(id: number): void {

    this.adminMenuService.deleteCategory(id).subscribe({

      next: () => {
        this.categories.update(cats => cats.filter(c => c.id !== id));
        this.showNotification('Category deleted.', 'success');
      },

      error: () => {
        this.showNotification('Failed to delete category.', 'error');
      }

    });

  }

  // ── Notification ──────────────────────────────────────────────────────────

  private showNotification(message: string, type: 'success' | 'error'): void {
    if (type === 'success') {
      this.notificationService.success(message);
    } else {
      this.notificationService.error(message);
    }
  }

}
