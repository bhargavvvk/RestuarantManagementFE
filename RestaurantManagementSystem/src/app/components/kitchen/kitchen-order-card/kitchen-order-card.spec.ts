import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KitchenOrderCard } from './kitchen-order-card';

describe('KitchenOrderCard', () => {
  let component: KitchenOrderCard;
  let fixture: ComponentFixture<KitchenOrderCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KitchenOrderCard],
    }).compileComponents();

    fixture = TestBed.createComponent(KitchenOrderCard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
