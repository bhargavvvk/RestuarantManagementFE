import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WaiterMenuFilter } from './waiter-menu-filter';

describe('WaiterMenuFilter', () => {
  let component: WaiterMenuFilter;
  let fixture: ComponentFixture<WaiterMenuFilter>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WaiterMenuFilter],
    }).compileComponents();

    fixture = TestBed.createComponent(WaiterMenuFilter);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
