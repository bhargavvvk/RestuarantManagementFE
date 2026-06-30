import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminMenuCard } from './admin-menu-card';

describe('AdminMenuCard', () => {
  let component: AdminMenuCard;
  let fixture: ComponentFixture<AdminMenuCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminMenuCard],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminMenuCard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
