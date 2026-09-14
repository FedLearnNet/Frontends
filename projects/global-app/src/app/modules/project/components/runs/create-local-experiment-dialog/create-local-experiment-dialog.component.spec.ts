import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateLocalExperimentDialogComponent } from './create-local-experiment-dialog.component';

describe('CreateLocalExperimentDialogComponent', () => {
  let component: CreateLocalExperimentDialogComponent;
  let fixture: ComponentFixture<CreateLocalExperimentDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateLocalExperimentDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateLocalExperimentDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
