import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VegToggle } from './veg-toggle';

describe('VegToggle', () => {
  let component: VegToggle;
  let fixture: ComponentFixture<VegToggle>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VegToggle],
    }).compileComponents();

    fixture = TestBed.createComponent(VegToggle);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
