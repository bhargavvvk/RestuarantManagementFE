import { Component, inject } from '@angular/core';
import { WaiterTableService } from '../../../services/waiter-table';

@Component({
  selector: 'app-waiter-search-bar',
  imports: [],
  templateUrl: './search-bar.html',
  styleUrl: './search-bar.css',
})
export class SearchBar {
    private menuService = inject(WaiterTableService);
  onSearch(event: Event) {

    const value =(event.target as HTMLInputElement).value;
    this.menuService.search.set(value);
    this.menuService.searchTrigger.next();
}
}
