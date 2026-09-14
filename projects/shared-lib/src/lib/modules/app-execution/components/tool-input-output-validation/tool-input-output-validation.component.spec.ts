import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ToolInputOutputValidationComponent } from './tool-input-output-validation.component';

describe('ToolInputOutputValidationComponent', () => {
  let component: ToolInputOutputValidationComponent;
  let fixture: ComponentFixture<ToolInputOutputValidationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ToolInputOutputValidationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ToolInputOutputValidationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
