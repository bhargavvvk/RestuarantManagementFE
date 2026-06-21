import { Component, input } from '@angular/core';

@Component({
  selector: 'app-kitchen-header',
  imports: [],
  templateUrl: './kitchen-header.html',
  styleUrl: './kitchen-header.css'
})
export class KitchenHeader {

  totalOrders = input<number>(0);

}