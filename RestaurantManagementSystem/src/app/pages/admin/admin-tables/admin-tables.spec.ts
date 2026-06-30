import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminTables } from './admin-tables';

describe('AdminTables', () => {
  let component: AdminTables;
  let fixture: ComponentFixture<AdminTables>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminTables],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminTables);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
