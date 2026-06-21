import { Component, inject, input } from '@angular/core';
import { Auth } from '../../../services/auth';

@Component({
  selector: 'app-kitchen-header',
  imports: [],
  templateUrl: './kitchen-header.html',
  styleUrl: './kitchen-header.css'
})
export class KitchenHeader {

  totalOrders = input<number>(0);

  private readonly auth = inject(Auth);

  logout(): void {
    this.auth.logout();
  }
}