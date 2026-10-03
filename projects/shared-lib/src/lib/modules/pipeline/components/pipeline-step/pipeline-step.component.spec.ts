import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PipelineStepComponent } from './pipeline-step.component';

describe('PipelineStepComponent', () => {
  let _component: PipelineStepComponent;
  let fixture: ComponentFixture<PipelineStepComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PipelineStepComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PipelineStepComponent);
    _component = fixture.componentInstance;
    fixture.detectChanges();
  });

});
