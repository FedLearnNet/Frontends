import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkflowPaletteComponent } from './workflow-palette.component';

describe('WorkflowPaletteComponent', () => {
  let _component: WorkflowPaletteComponent;
  let fixture: ComponentFixture<WorkflowPaletteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorkflowPaletteComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WorkflowPaletteComponent);
    _component = fixture.componentInstance;
    fixture.detectChanges();
  });
});
