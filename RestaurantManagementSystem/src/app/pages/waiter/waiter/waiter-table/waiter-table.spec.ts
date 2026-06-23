import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WaiterTable } from './waiter-table';

describe('WaiterTable', () => {
  let component: WaiterTable;
  let fixture: ComponentFixture<WaiterTable>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WaiterTable],
    }).compileComponents();

    fixture = TestBed.createComponent(WaiterTable);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
