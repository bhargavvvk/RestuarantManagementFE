import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KitchenHeader } from './kitchen-header';

describe('KitchenHeader', () => {
  let component: KitchenHeader;
  let fixture: ComponentFixture<KitchenHeader>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KitchenHeader],
    }).compileComponents();

    fixture = TestBed.createComponent(KitchenHeader);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
