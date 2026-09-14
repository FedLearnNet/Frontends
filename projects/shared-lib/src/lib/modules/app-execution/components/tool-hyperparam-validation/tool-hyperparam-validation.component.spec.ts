import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ToolHyperparamValidationComponent } from './tool-hyperparam-validation.component';

describe('ToolHyperparamValidationComponent', () => {
  let component: ToolHyperparamValidationComponent;
  let fixture: ComponentFixture<ToolHyperparamValidationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ToolHyperparamValidationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ToolHyperparamValidationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
