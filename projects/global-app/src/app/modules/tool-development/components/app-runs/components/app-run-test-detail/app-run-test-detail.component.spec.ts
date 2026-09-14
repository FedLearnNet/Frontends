import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppRunTestDetailComponent } from './app-run-test-detail.component';

describe('AppRunTestDetailComponent', () => {
  let component: AppRunTestDetailComponent;
  let fixture: ComponentFixture<AppRunTestDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppRunTestDetailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AppRunTestDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
