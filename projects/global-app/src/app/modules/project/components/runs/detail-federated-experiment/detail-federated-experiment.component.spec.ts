import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailFederatedExperimentComponent } from './detail-federated-experiment.component';

describe('DetailFederatedExperimentComponent', () => {
  let component: DetailFederatedExperimentComponent;
  let fixture: ComponentFixture<DetailFederatedExperimentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetailFederatedExperimentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DetailFederatedExperimentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
