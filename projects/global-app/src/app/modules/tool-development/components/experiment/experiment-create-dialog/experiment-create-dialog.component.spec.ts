import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExperimentCreateDialogComponent } from './experiment-create-dialog.component';

describe('ExperimentCreateDialogComponent', () => {
  let component: ExperimentCreateDialogComponent;
  let fixture: ComponentFixture<ExperimentCreateDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExperimentCreateDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExperimentCreateDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
