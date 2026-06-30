import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminTableModal } from './admin-table-modal';

describe('AdminTableModal', () => {
  let component: AdminTableModal;
  let fixture: ComponentFixture<AdminTableModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminTableModal],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminTableModal);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
