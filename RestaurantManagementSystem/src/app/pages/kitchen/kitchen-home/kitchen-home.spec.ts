import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KitchenHome } from './kitchen-home';

describe('KitchenHome', () => {
  let component: KitchenHome;
  let fixture: ComponentFixture<KitchenHome>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KitchenHome],
    }).compileComponents();

    fixture = TestBed.createComponent(KitchenHome);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
