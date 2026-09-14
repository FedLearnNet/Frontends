import {ComponentFixture, TestBed} from '@angular/core/testing';

import {LocalTestExperimentComponent} from './local-test-experiment.component';

describe('LocalTestExperimentComponent', () => {
  let _component: LocalTestExperimentComponent;
  let fixture: ComponentFixture<LocalTestExperimentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LocalTestExperimentComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(LocalTestExperimentComponent);
    _component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
  });
});
