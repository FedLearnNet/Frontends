import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppDetailMonitorComponent } from './app-detail-monitor.component';

describe('AppDetailMonitorComponent', () => {
  let component: AppDetailMonitorComponent;
  let fixture: ComponentFixture<AppDetailMonitorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppDetailMonitorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AppDetailMonitorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
