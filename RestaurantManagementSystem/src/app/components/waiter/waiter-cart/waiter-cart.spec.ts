import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WaiterCart } from './waiter-cart';

describe('WaiterCart', () => {
  let component: WaiterCart;
  let fixture: ComponentFixture<WaiterCart>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WaiterCart],
    }).compileComponents();

    fixture = TestBed.createComponent(WaiterCart);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
