import { Component, input, output } from '@angular/core';
import { TaxConfiguration } from '../../../models/admin-tax.models';

@Component({
  selector: 'app-admin-tax-card',
  imports: [],
  templateUrl: './admin-tax-card.html',
  styleUrl: './admin-tax-card.css',
})
export class AdminTaxCard {
  readonly config = input.required<TaxConfiguration>();
  readonly editClicked = output<void>();
}
