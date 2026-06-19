import { Routes } from '@angular/router';
import { CustomerEntry } from './pages/customer/customer-entry/customer-entry';
import { CustomerOperations } from './pages/customer/customer-operations/customer-operations';

export const routes: Routes = [
    {
        path:'join/:tableIdentifier',
        component:CustomerEntry
    },
    {
        path: 'join/:tableIdentifier/operations',
        component: CustomerOperations
    }
];
