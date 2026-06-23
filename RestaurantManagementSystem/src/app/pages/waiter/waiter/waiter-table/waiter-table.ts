import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Waiter } from '../../../../services/waiter';
import { Auth } from '../../../../services/auth';
import { WaiterMenuList } from "../../../../components/waiter/waiter-menu-list/waiter-menu-list";
import { WaiterTableService } from '../../../../services/waiter-table';
import { WaiterMenuFilter } from "../../../../components/waiter/waiter-menu-filter/waiter-menu-filter";

@Component({
  selector: 'app-waiter-table',
  imports: [WaiterMenuList, WaiterMenuFilter],
  templateUrl: './waiter-table.html',
  styleUrl: './waiter-table.css',
})
export class WaiterTable {
  private readonly waiterTableService=inject(WaiterTableService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly waiter = inject(Waiter);
  private readonly auth = inject(Auth);
  readonly tableId =
    Number(this.route.snapshot.paramMap.get('tableId'));
   ngOnInit(): void {
    this.validateAccess();
    this.waiterTableService
    .loadCart(this.tableId)
    .subscribe();
  }
  private validateAccess(): void {

  const table = this.waiter.tables()
      .find(
        t => t.tableId === this.tableId
      );

    if (!table) {

      this.router.navigate([
        'waiter'
      ]);

      return;

    }

    const status =
      table.status.toLowerCase();

    if (
      status === 'available' ||
      status === 'unavailable'
    ) {

      this.router.navigate([
        'waiter'
      ]);

    }

  }
  readonly selectedTab =
    signal<'menu' | 'cart' | 'orders' | 'bill'>(
      'menu'
    );

  setTab(
    tab: 'menu' | 'cart' | 'orders' | 'bill'
  ): void {

    this.selectedTab.set(tab);

  }

  goBack(): void {

    this.router.navigate([
      'waiter'
    ]);

  }

  logout(): void {
    this.auth.logout();
  }

  goToTables(): void {

    this.router.navigate([
      'waiter'
    ]);

  }

  goToRequests(): void {

    this.router.navigate(
      ['waiter'],
      {
        queryParams: {
          tab: 'requests'
        }
      }
    );

  }

}