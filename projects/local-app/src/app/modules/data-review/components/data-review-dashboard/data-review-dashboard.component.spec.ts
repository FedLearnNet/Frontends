import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DataReviewDashboardComponent } from './data-review-dashboard.component';

describe('DashboardComponent', () => {
  let component: DataReviewDashboardComponent;
  let fixture: ComponentFixture<DataReviewDashboardComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
    imports: [DataReviewDashboardComponent]
});
    fixture = TestBed.createComponent(DataReviewDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
