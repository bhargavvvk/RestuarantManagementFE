import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JoinSessionCard } from './join-session-card';

describe('JoinSessionCard', () => {
  let component: JoinSessionCard;
  let fixture: ComponentFixture<JoinSessionCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JoinSessionCard],
    }).compileComponents();

    fixture = TestBed.createComponent(JoinSessionCard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
