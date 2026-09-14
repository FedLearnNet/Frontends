import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminDockerDashboardComponent } from './admin-docker-dashboard.component';

describe('AdminDockerDashboardComponent', () => {
  let component: AdminDockerDashboardComponent;
  let fixture: ComponentFixture<AdminDockerDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminDockerDashboardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminDockerDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
