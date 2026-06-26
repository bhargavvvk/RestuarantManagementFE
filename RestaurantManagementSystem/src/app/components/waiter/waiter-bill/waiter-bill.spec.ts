import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WaiterBill } from './waiter-bill';

describe('WaiterBill', () => {
  let component: WaiterBill;
  let fixture: ComponentFixture<WaiterBill>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WaiterBill],
    }).compileComponents();

    fixture = TestBed.createComponent(WaiterBill);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
