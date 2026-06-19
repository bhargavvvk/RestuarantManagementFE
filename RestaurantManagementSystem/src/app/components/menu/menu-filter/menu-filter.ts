import { Component } from '@angular/core';
import { SearchBar } from "../search-bar/search-bar";
import { VegToggle } from "../veg-toggle/veg-toggle";
import { CategoryChips } from "../category-chips/category-chips";

@Component({
  selector: 'app-menu-filter',
  imports: [SearchBar, VegToggle, CategoryChips],
  templateUrl: './menu-filter.html',
  styleUrl: './menu-filter.css',
})
export class MenuFilter {}
