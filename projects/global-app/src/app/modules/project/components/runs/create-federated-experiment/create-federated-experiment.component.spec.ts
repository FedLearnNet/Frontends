import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateFederatedExperimentComponent } from './create-federated-experiment.component';

describe('CreateExperimentComponent', () => {
  let component: CreateFederatedExperimentComponent;
  let fixture: ComponentFixture<CreateFederatedExperimentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateFederatedExperimentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateFederatedExperimentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
