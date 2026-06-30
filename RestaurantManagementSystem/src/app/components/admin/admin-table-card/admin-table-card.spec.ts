import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminTableCard } from './admin-table-card';

describe('AdminTableCard', () => {
  let component: AdminTableCard;
  let fixture: ComponentFixture<AdminTableCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminTableCard],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminTableCard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
