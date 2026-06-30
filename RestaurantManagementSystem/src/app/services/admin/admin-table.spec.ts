import { TestBed } from '@angular/core/testing';

import { AdminTable } from './admin-table';

describe('AdminTable', () => {
  let service: AdminTable;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AdminTable);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
