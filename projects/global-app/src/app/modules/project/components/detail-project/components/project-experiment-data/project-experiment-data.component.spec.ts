import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectExperimentDataComponent } from './project-experiment-data.component';

describe('ProjectLocalExperimentDataComponent', () => {
  let _component: ProjectExperimentDataComponent;
  let fixture: ComponentFixture<ProjectExperimentDataComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectExperimentDataComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProjectExperimentDataComponent);
    _component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    //expect(component).toBeTruthy();
  });
});
