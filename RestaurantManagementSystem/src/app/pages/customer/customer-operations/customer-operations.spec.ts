import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerOperations } from './customer-operations';

describe('CustomerOperations', () => {
  let component: CustomerOperations;
  let fixture: ComponentFixture<CustomerOperations>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomerOperations],
    }).compileComponents();

    fixture = TestBed.createComponent(CustomerOperations);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
