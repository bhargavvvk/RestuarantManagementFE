import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WaiterHome } from './waiter-home';

describe('WaiterHome', () => {
  let component: WaiterHome;
  let fixture: ComponentFixture<WaiterHome>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WaiterHome],
    }).compileComponents();

    fixture = TestBed.createComponent(WaiterHome);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
