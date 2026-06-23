import { TestBed } from '@angular/core/testing';

import { WaiterTable } from './waiter-table';

describe('WaiterTable', () => {
  let service: WaiterTable;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WaiterTable);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
