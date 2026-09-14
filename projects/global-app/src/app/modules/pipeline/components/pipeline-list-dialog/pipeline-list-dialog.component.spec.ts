import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PipelineListDialogComponent } from './pipeline-list-dialog.component';

describe('PipelineListDialogComponent', () => {
  let component: PipelineListDialogComponent;
  let fixture: ComponentFixture<PipelineListDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PipelineListDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PipelineListDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
