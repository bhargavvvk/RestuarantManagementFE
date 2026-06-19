import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MenuFilter } from './menu-filter';

describe('MenuFilter', () => {
  let component: MenuFilter;
  let fixture: ComponentFixture<MenuFilter>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MenuFilter],
    }).compileComponents();

    fixture = TestBed.createComponent(MenuFilter);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
