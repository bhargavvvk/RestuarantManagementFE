import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerRequest } from './customer-request';

describe('CustomerRequest', () => {
  let component: CustomerRequest;
  let fixture: ComponentFixture<CustomerRequest>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomerRequest],
    }).compileComponents();

    fixture = TestBed.createComponent(CustomerRequest);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
