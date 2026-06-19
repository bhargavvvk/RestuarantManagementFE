import { Component, inject } from '@angular/core';
import { MenuService } from '../../../services/menu-service';

@Component({
  selector: 'app-search-bar',
  imports: [],
  templateUrl: './search-bar.html',
  styleUrl: './search-bar.css',
})
export class SearchBar {
  private menuService = inject(MenuService);
  onSearch(event: Event) {

  const value =(event.target as HTMLInputElement).value;
  this.menuService.search.set(value);
  this.menuService.searchTrigger.next();
}
}
