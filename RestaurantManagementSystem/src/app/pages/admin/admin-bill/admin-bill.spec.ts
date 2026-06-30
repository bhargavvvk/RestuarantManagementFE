import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminBill } from './admin-bill';

describe('AdminBill', () => {
  let component: AdminBill;
  let fixture: ComponentFixture<AdminBill>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminBill],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminBill);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
