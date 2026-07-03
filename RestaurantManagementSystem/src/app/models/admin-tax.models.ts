export interface TaxConfiguration {
  cgstPercentage: number;
  sgstPercentage: number;
  serviceChargePercentage: number;
}

export interface UpdateTaxRequest {
  cgstPercentage: number;
  sgstPercentage: number;
  serviceChargePercentage: number;
}
