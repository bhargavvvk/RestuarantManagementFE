import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PreparingOrderCard } from './preparing-order-card';

describe('PreparingOrderCard', () => {
  let component: PreparingOrderCard;
  let fixture: ComponentFixture<PreparingOrderCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PreparingOrderCard],
    }).compileComponents();

    fixture = TestBed.createComponent(PreparingOrderCard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
