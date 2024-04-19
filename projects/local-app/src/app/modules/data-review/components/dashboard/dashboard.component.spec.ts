import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DataReviewDashboardComponent } from './dashboard.component';

describe('DashboardComponent', () => {
  let component: DataReviewDashboardComponent;
  let fixture: ComponentFixture<DataReviewDashboardComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DataReviewDashboardComponent]
    });
    fixture = TestBed.createComponent(DataReviewDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
