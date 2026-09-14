import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PipelineDetailComponent } from './pipeline-detail.component';

describe('PipelineDetailComponent', () => {
  let _component: PipelineDetailComponent;
  let fixture: ComponentFixture<PipelineDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PipelineDetailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PipelineDetailComponent);
    _component = fixture.componentInstance;
    fixture.detectChanges();
  });

});
