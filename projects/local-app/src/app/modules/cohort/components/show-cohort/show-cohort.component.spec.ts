import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShowCohortComponent } from './show-cohort.component';

describe('ShowCohortComponent', () => {
  let component: ShowCohortComponent;
  let fixture: ComponentFixture<ShowCohortComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ShowCohortComponent]
    });
    fixture = TestBed.createComponent(ShowCohortComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
