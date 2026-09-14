import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppHyperParamInputComponent } from './app-hyper-param-input.component';

describe('AppHyperParamInputComponent', () => {
  let component: AppHyperParamInputComponent;
  let fixture: ComponentFixture<AppHyperParamInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppHyperParamInputComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AppHyperParamInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
