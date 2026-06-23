import { Component } from '@angular/core';
import { SearchBar } from "../search-bar/search-bar";
import { VegToggle } from "../veg-toggle/veg-toggle";
import { WaiterCategoryChips } from "../waiter-category-chips/waiter-category-chips";

@Component({
  selector: 'app-waiter-menu-filter',
  imports: [SearchBar, VegToggle, WaiterCategoryChips],
  templateUrl: './waiter-menu-filter.html',
  styleUrl: './waiter-menu-filter.css',
})
export class WaiterMenuFilter {}
