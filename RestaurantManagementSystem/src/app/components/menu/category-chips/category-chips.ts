import { Component, inject, signal } from '@angular/core';
import { Category } from '../../../models/customer.models';
import { Customer } from '../../../services/customer';
import { MenuService } from '../../../services/menu-service';

@Component({
  selector: 'app-category-chips',
  imports: [],
  templateUrl: './category-chips.html',
  styleUrl: './category-chips.css',
})
export class CategoryChips {

  public menuService = inject(MenuService);

  categories = signal<Category[]>([]);

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
