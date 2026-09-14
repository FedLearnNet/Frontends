import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppRunInputComponent } from './app-run-input.component';

describe('AppRunInputComponent', () => {
  let component: AppRunInputComponent;
  let fixture: ComponentFixture<AppRunInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppRunInputComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AppRunInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
