import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PipelinePublishInfoDetailComponent } from './pipeline-publish-info-detail.component';

describe('PipelinePublishInfoDetailComponent', () => {
  let _component: PipelinePublishInfoDetailComponent;
  let fixture: ComponentFixture<PipelinePublishInfoDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PipelinePublishInfoDetailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PipelinePublishInfoDetailComponent);
    _component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
  //  expect(component).toBeTruthy();
  });
});
