import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminMenuModal } from './admin-menu-modal';

describe('AdminMenuModal', () => {
  let component: AdminMenuModal;
  let fixture: ComponentFixture<AdminMenuModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminMenuModal],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminMenuModal);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
