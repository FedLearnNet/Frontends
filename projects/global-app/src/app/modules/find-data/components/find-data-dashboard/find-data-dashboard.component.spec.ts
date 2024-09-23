import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FindDataDashboardComponent } from './dashboard.component';

describe('DashboardComponent', () => {
  let component: FindDataDashboardComponent;
  let fixture: ComponentFixture<FindDataDashboardComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [FindDataDashboardComponent]
    });
    fixture = TestBed.createComponent(FindDataDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
