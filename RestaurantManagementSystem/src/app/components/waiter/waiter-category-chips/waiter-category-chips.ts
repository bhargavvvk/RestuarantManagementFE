import { Component, inject, signal } from '@angular/core';
import { WaiterTableService } from '../../../services/waiter-table';
import { MenuCategory } from '../../../models/waiter.models';

@Component({
  selector: 'app-waiter-category-chips',
  imports: [],
  templateUrl: './waiter-category-chips.html',
  styleUrl: './waiter-category-chips.css',
})
export class WaiterCategoryChips {
  public menuService = inject(WaiterTableService);

  categories = signal<MenuCategory[]>([]);

  ngOnInit(): void {
    this.menuService
      .getCategories()
      .subscribe({
        next: categories => {
          this.categories.set(categories);

          if (
            categories.length > 0 &&
            this.menuService.selectedCategoryId() === null
          ) {
            this.menuService
              .selectedCategoryId
              .set(categories[0].id);
          }
        }
      });
  }

  selectCategory(id: number): void {
    this.menuService
      .selectedCategoryId
      .set(id);
  }
}
