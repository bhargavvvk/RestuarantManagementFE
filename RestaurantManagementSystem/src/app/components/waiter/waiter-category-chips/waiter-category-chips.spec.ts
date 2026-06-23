import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WaiterCategoryChips } from './waiter-category-chips';

describe('WaiterCategoryChips', () => {
  let component: WaiterCategoryChips;
  let fixture: ComponentFixture<WaiterCategoryChips>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WaiterCategoryChips],
    }).compileComponents();

    fixture = TestBed.createComponent(WaiterCategoryChips);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
