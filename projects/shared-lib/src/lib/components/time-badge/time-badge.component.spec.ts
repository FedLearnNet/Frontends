import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TimeBadgeComponent } from './time-badge.component';

describe('TimeBadgeComponent', () => {
  let component: TimeBadgeComponent;
  let fixture: ComponentFixture<TimeBadgeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TimeBadgeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TimeBadgeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
