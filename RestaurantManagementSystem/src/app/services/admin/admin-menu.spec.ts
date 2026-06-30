import { TestBed } from '@angular/core/testing';

import { AdminMenu } from './admin-menu';

describe('AdminMenu', () => {
  let service: AdminMenu;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AdminMenu);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
