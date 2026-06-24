import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WaiterOrder } from './waiter-order';

describe('WaiterOrder', () => {
  let component: WaiterOrder;
  let fixture: ComponentFixture<WaiterOrder>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WaiterOrder],
    }).compileComponents();

    fixture = TestBed.createComponent(WaiterOrder);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
