import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppRunTestStartComponent } from './app-run-test-start.component';

describe('AppRunTestStartComponent', () => {
  let component: AppRunTestStartComponent;
  let fixture: ComponentFixture<AppRunTestStartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppRunTestStartComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AppRunTestStartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
