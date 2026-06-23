import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WaiterMenuList } from './waiter-menu-list';

describe('WaiterMenuList', () => {
  let component: WaiterMenuList;
  let fixture: ComponentFixture<WaiterMenuList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WaiterMenuList],
    }).compileComponents();

    fixture = TestBed.createComponent(WaiterMenuList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
