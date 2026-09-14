import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateLocalExperimentComponent } from './create-local-experiment.component';

describe('CreateLocalExperimentComponent', () => {
  let _component: CreateLocalExperimentComponent;
  let fixture: ComponentFixture<CreateLocalExperimentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateLocalExperimentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateLocalExperimentComponent);
    _component = fixture.componentInstance;
    fixture.detectChanges();
  });
});
