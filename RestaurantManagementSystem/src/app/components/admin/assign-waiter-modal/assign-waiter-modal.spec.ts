import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssignWaiterModal } from './assign-waiter-modal';

describe('AssignWaiterModal', () => {
  let component: AssignWaiterModal;
  let fixture: ComponentFixture<AssignWaiterModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssignWaiterModal],
    }).compileComponents();

    fixture = TestBed.createComponent(AssignWaiterModal);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('isOpen', false);
    fixture.componentRef.setInput('waiters', []);
    fixture.componentRef.setInput('tables', []);
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
