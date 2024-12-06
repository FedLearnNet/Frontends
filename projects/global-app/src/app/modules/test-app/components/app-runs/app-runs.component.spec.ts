import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppRunsComponent } from './app-runs.component';

describe('AppRunsComponent', () => {
  let component: AppRunsComponent;
  let fixture: ComponentFixture<AppRunsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppRunsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AppRunsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
