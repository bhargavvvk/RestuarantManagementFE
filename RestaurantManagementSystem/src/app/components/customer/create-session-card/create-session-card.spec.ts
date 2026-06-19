import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateSessionCard } from './create-session-card';

describe('CreateSessionCard', () => {
  let component: CreateSessionCard;
  let fixture: ComponentFixture<CreateSessionCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateSessionCard],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateSessionCard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
