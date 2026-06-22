import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Customer } from '../../../services/customer';
import { TableInfo } from '../../../models/customer.models';
import { Header } from "../../../components/customer/header/header";
import { JoinSessionCard } from "../../../components/customer/join-session-card/join-session-card";
import { CreateSessionCard } from "../../../components/customer/create-session-card/create-session-card";
import { CustomerSession } from '../../../services/customer-session';

@Component({
  selector: 'app-customer-entry',
  imports: [Header, JoinSessionCard, CreateSessionCard],
  templateUrl: './customer-entry.html',
  styleUrl: './customer-entry.css',
})
export class CustomerEntry {
  tableIdentifier='';
  private router = inject(Router);
  tableInfo = signal<TableInfo | null>(null);
  isLoading = signal(true);
  hasTableError = signal(false);
  private customerSession=inject(CustomerSession);
  constructor(private route:ActivatedRoute,private customerService: Customer){}
    ngOnInit(): void {
      this.tableIdentifier =
      this.route.snapshot.paramMap.get('tableIdentifier') ?? '';
      if (!this.tableIdentifier) {
        this.hasTableError.set(true);
        this.isLoading.set(false);
        return;
      }
      this.customerService.getTable(this.tableIdentifier).subscribe({
        next: response => {
          this.tableInfo.set(response);
          this.hasTableError.set(false);
        },
        error: err => {
          this.hasTableError.set(true);
          this.isLoading.set(false);
        },
        complete: () => {
          this.isLoading.set(false);
        }
      });
      this.checkExistingSession();
  }
  
  headerVariant = computed(() => {

      const table = this.tableInfo();
      return table!.hasActiveSession
          ? 'join-session'
          : 'create-session';
  });
  private checkExistingSession(): void {
    if (!this.customerSession.hasToken()) {
      return;
    }
    this.customerService
      .validateSession()
      .subscribe({
        next: response => {
        if (response.isActive &&
            response.tableIdentifier === this.tableIdentifier) {
          this.router.navigate(['/join',this.tableIdentifier,'operations']);
          return;
        }
      },
        error: error => {
          this.customerSession.clearSession();
        }
      });
  }
}
