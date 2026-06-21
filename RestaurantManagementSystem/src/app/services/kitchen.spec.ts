import { TestBed } from '@angular/core/testing';

import { Kitchen } from './kitchen';

describe('Kitchen', () => {
  let service: Kitchen;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Kitchen);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
