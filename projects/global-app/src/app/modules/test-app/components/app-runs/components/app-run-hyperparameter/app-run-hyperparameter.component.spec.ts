import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppRunHyperparameterComponent } from './app-run-hyperparameter.component';

describe('AppRunHyperparameterComponent', () => {
  let component: AppRunHyperparameterComponent;
  let fixture: ComponentFixture<AppRunHyperparameterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppRunHyperparameterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AppRunHyperparameterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
