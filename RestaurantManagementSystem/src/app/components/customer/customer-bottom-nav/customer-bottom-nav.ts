import { Component, input, output } from '@angular/core';
export type CustomerTab =
  'menu' | 'cart' | 'orders' | 'ai';
@Component({
  selector: 'app-customer-bottom-nav',
  imports: [],
  templateUrl: './customer-bottom-nav.html',
  styleUrl: './customer-bottom-nav.css',
})
export class CustomerBottomNav {
  activeTab = input<CustomerTab>('menu');
   tabChanged = output<CustomerTab>();
    selectTab(tab: CustomerTab)
     {this.tabChanged.emit(tab);
  }

}
