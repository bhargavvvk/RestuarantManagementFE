import { Routes } from '@angular/router';
import { CustomerEntry } from './pages/customer/customer-entry/customer-entry';
import { CustomerOperations } from './pages/customer/customer-operations/customer-operations';
import { Login } from './pages/auth/login/login';
import { WaiterHome } from './pages/waiter/waiter-home/waiter-home';
import { KitchenHome } from './pages/kitchen/kitchen-home/kitchen-home';
import { AdminHome } from './pages/admin/admin-home/admin-home';
import { AdminTables } from './pages/admin/admin-tables/admin-tables';
import { AdminTableDetail } from './pages/admin/admin-table-detail/admin-table-detail';
import { AdminOrders } from './pages/admin/admin-orders/admin-orders';
import { authGuard } from './guards/auth-guard';
import { WaiterTable } from './pages/waiter/waiter/waiter-table/waiter-table';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },

  {
    path: 'join/:tableIdentifier',
    component: CustomerEntry
  },

  {
    path: 'join/:tableIdentifier/operations',
    component: CustomerOperations,
    canActivate: [authGuard],
    data: {
      roles: ['Customer']
    }
  },

  {
    path: 'login',
    component: Login
  },

  {
    path: 'waiter',
    component: WaiterHome,
    canActivate: [authGuard],
    data: {
      roles: ['Waiter']
    }
  },

  {
    path: 'kitchen',
    component: KitchenHome,
    canActivate: [authGuard],
    data: {
      roles: ['KitchenStaff']
    }
  },

  {
    path: 'admin',
    component: AdminHome,
    canActivate: [authGuard],
    data: {
      roles: ['Admin']
    },
    children: [
      {
        path: '',
        redirectTo: 'tables',
        pathMatch: 'full'
      },
      {
        path: 'tables',
        component: AdminTables,
        data: { title: 'Tables Management' }
      },
      {
        path: 'tables/:tableId',
        component: AdminTableDetail,
        data: { title: 'Table Details' }
      },
      {
        path: 'orders',
        component: AdminOrders,
        data: { title: 'Orders Management' }
      }
    ]
  },
  {
    path:'waiter/tables/:tableId',
    component: WaiterTable,
    canActivate: [authGuard],
    data:{
      roles: ['Waiter']
    }
  }
];