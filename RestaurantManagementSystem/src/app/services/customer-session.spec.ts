import { TestBed } from '@angular/core/testing';

import { CustomerSession } from './customer-session';

describe('CustomerSession', () => {
  let service: CustomerSession;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CustomerSession);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
