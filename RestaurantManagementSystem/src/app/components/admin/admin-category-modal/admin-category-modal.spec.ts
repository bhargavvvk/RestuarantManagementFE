import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminCategoryModal } from './admin-category-modal';

describe('AdminCategoryModal', () => {
  let component: AdminCategoryModal;
  let fixture: ComponentFixture<AdminCategoryModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminCategoryModal],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminCategoryModal);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
