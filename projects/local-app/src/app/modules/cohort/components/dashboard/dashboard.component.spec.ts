import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CohortDashboardComponent } from './dashboard.component';

describe('DashboardComponent', () => {
  let component: CohortDashboardComponent;
  let fixture: ComponentFixture<CohortDashboardComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CohortDashboardComponent]
    });
    fixture = TestBed.createComponent(CohortDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
