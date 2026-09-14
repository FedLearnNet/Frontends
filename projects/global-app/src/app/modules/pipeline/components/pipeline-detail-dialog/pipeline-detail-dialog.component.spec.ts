import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PipelineDetailDialogComponent } from './pipeline-detail-dialog.component';

describe('PipelineDetailDialogComponent', () => {
  let component: PipelineDetailDialogComponent;
  let fixture: ComponentFixture<PipelineDetailDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PipelineDetailDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PipelineDetailDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
