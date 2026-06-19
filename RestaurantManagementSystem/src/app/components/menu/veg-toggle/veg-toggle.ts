import { Component, inject } from '@angular/core';
import { MenuService } from '../../../services/menu-service';

@Component({
  selector: 'app-veg-toggle',
  imports: [],
  templateUrl: './veg-toggle.html',
  styleUrl: './veg-toggle.css',
})
export class VegToggle {
  public menuService =inject(MenuService);
  onToggle(event: Event) {
  const checked =
    (event.target as HTMLInputElement)
      .checked;

  this.menuService
      .vegOnly
      .set(checked);

}
}
