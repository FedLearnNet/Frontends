import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  FindDataDashboardComponent
} from "@global-app/find-data/components/find-data-dashboard/find-data-dashboard.component";


describe('DashboardComponent', () => {
  let component: FindDataDashboardComponent;
  let fixture: ComponentFixture<FindDataDashboardComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
    imports: [FindDataDashboardComponent]
});
    fixture = TestBed.createComponent(FindDataDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
