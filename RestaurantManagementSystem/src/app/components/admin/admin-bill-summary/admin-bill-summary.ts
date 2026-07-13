import { DecimalPipe } from '@angular/common';
import { Component, computed, ElementRef, inject, input, output, viewChild } from '@angular/core';
import { AdminTableBill, AdminTableOrder, OrderItemStatus } from '../../../models/admin-table.models';

export interface BillLineItem {
  name: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

@Component({
  selector: 'app-admin-bill-summary',
  imports: [DecimalPipe],
  templateUrl: './admin-bill-summary.html',
  styleUrl: './admin-bill-summary.css',
})
export class AdminBillSummary {
  readonly bill = input<AdminTableBill | null>(null);
  readonly orders = input<AdminTableOrder[]>([]);

  readonly serviceChargeToggle = output<boolean>();
  readonly printRequested = output<void>();

  private readonly printArea = viewChild<ElementRef<HTMLElement>>('printArea');

  readonly isServiceChargeIncluded = computed(() => {
    const bill = this.bill();
    return !!bill && bill.serviceChargeAmount > 0;
  });

  readonly paymentStatusLabel = computed(() =>
    this.bill()?.paymentStatus === 1 ? 'Paid' : 'Pending Payment'
  );

  /** Aggregate all non-cancelled items across orders into a single list */
  readonly lineItems = computed<BillLineItem[]>(() => {
    const map = new Map<string, BillLineItem>();
    for (const order of this.orders()) {
      for (const item of order.items) {
        if (item.status === OrderItemStatus.Cancelled) continue;
        const existing = map.get(item.itemName);
        if (existing) {
          existing.quantity += item.quantity;
          existing.lineTotal += item.itemPrice * item.quantity;
        } else {
          map.set(item.itemName, {
            name: item.itemName,
            quantity: item.quantity,
            unitPrice: item.itemPrice,
            lineTotal: item.itemPrice * item.quantity,
          });
        }
      }
    }
    return Array.from(map.values());
  });

  onServiceChargeToggle(event: Event): void {
    const includeServiceCharge = (event.target as HTMLInputElement).checked;
    this.serviceChargeToggle.emit(includeServiceCharge);
  }

  onPrint(): void {
    const el = this.printArea()?.nativeElement;
    if (!el) {
      console.warn('printArea ref not found');
      return;
    }

    const win = window.open('', '_blank', 'width=320,height=600');
    if (!win) {
      alert('Please allow popups for this site to print the bill.');
      return;
    }

    const bill = this.bill();
    const items = this.lineItems();
    const now = new Date();
    const timestamp = now.toLocaleString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit', hour12: true
    });

    const itemRows = items.map(item => `
      <tr>
        <td class="item-name">${item.name}</td>
        <td class="center">${item.quantity}</td>
        <td class="right">&#8377; ${item.lineTotal.toFixed(2)}</td>
      </tr>
    `).join('');

    const serviceChargeRow = bill && bill.serviceChargeAmount > 0 ? `
      <tr class="tax-row">
        <td colspan="2">Service Charge (${bill.serviceChargePercentage}%)</td>
        <td class="right">&#8377; ${bill.serviceChargeAmount.toFixed(2)}</td>
      </tr>
    ` : '';

    win.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Bill</title>
          <style>
            @page {
              size: 80mm auto;
              margin: 0;
            }
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body {
              font-family: 'Courier New', Courier, monospace;
              font-size: 12px;
              color: #000;
              width: 80mm;
              padding: 10mm 6mm;
            }
            .restaurant-name {
              text-align: center;
              font-size: 16px;
              font-weight: bold;
              letter-spacing: 1px;
              margin-bottom: 2px;
            }
            .restaurant-sub {
              text-align: center;
              font-size: 10px;
              color: #444;
              margin-bottom: 8px;
            }
            .divider {
              border: none;
              border-top: 1px dashed #000;
              margin: 6px 0;
            }
            .meta {
              font-size: 10px;
              display: flex;
              justify-content: space-between;
              margin-bottom: 2px;
              color: #333;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin: 4px 0;
            }
            thead tr th {
              font-size: 10px;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              padding-bottom: 4px;
              border-bottom: 1px dashed #000;
            }
            thead .center, tbody .center { text-align: center; }
            thead .right, tbody .right, tfoot .right { text-align: right; }
            tbody tr td {
              padding: 3px 0;
              font-size: 11px;
              vertical-align: top;
            }
            .item-name { max-width: 42mm; word-break: break-word; }
            .tax-row td {
              font-size: 10px;
              color: #444;
              padding: 2px 0;
            }
            .subtotal-row td {
              padding: 3px 0;
              font-size: 11px;
            }
            .total-row td {
              font-size: 14px;
              font-weight: bold;
              padding-top: 6px;
            }
            .status-badge {
              text-align: center;
              font-size: 10px;
              font-weight: bold;
              letter-spacing: 1px;
              margin: 6px 0;
              padding: 3px;
              border: 1px solid #000;
            }
            .status-badge.paid { border-color: #000; }
            .footer {
              text-align: center;
              font-size: 10px;
              color: #444;
              margin-top: 10px;
            }
          </style>
        </head>
        <body>
          <div class="restaurant-name">RESTAURANT</div>
          <div class="restaurant-sub">Thank you for dining with us!</div>

          <hr class="divider">

          <div class="meta">
            <span>Bill #: ${bill?.billNumber ?? '-'}</span>
            <span>${timestamp}</span>
          </div>

          <hr class="divider">

          <table>
            <thead>
              <tr>
                <th style="text-align:left">Item</th>
                <th class="center">Qty</th>
                <th class="right">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${itemRows}
            </tbody>
          </table>

          <hr class="divider">

          <table>
            <tbody>
              <tr class="subtotal-row">
                <td colspan="2">Food Total</td>
                <td class="right">&#8377; ${bill?.foodTotal.toFixed(2) ?? '0.00'}</td>
              </tr>
              <tr class="tax-row">
                <td colspan="2">CGST (${bill?.cgstPercentage ?? 0}%)</td>
                <td class="right">&#8377; ${bill?.cgstAmount.toFixed(2) ?? '0.00'}</td>
              </tr>
              <tr class="tax-row">
                <td colspan="2">SGST (${bill?.sgstPercentage ?? 0}%)</td>
                <td class="right">&#8377; ${bill?.sgstAmount.toFixed(2) ?? '0.00'}</td>
              </tr>
              ${serviceChargeRow}
            </tbody>
          </table>

          <hr class="divider">

          <table>
            <tbody>
              <tr class="total-row">
                <td colspan="2">GRAND TOTAL</td>
                <td class="right">&#8377; ${bill?.grandTotal.toFixed(2) ?? '0.00'}</td>
              </tr>
            </tbody>
          </table>

          <hr class="divider">

          <div class="status-badge ${bill?.paymentStatus === 1 ? 'paid' : ''}">
            ${bill?.paymentStatus === 1 ? '*** PAID ***' : '*** PENDING PAYMENT ***'}
          </div>

          <div class="footer">
            Please visit again!<br>
            Taxes as applicable.
          </div>
        </body>
      </html>
    `);
    win.document.close();
    win.focus();
    setTimeout(() => {
      win.print();
      win.close();
    }, 250);
  }
}
