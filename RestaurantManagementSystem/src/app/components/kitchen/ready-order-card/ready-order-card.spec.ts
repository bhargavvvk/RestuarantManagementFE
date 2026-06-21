import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReadyOrderCard } from './ready-order-card';

describe('ReadyOrderCard', () => {
  let component: ReadyOrderCard;
  let fixture: ComponentFixture<ReadyOrderCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReadyOrderCard],
    }).compileComponents();

    fixture = TestBed.createComponent(ReadyOrderCard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
