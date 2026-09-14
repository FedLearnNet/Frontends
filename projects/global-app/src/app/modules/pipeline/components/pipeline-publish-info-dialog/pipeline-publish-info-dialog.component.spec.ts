import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PipelinePublishInfoDialogComponent } from './pipeline-publish-info-dialog.component';

describe('PipelinePublishInfoDialogComponent', () => {
  let component: PipelinePublishInfoDialogComponent;
  let fixture: ComponentFixture<PipelinePublishInfoDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PipelinePublishInfoDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PipelinePublishInfoDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
