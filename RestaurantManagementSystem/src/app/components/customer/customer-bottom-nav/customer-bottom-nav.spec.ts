import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerBottomNav } from './customer-bottom-nav';

describe('CustomerBottomNav', () => {
  let component: CustomerBottomNav;
  let fixture: ComponentFixture<CustomerBottomNav>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomerBottomNav],
    }).compileComponents();

    fixture = TestBed.createComponent(CustomerBottomNav);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
