import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListFederatedExperimentComponent } from './list-federated-experiment.component';

describe('ListFederatedExperimentComponent', () => {
  let component: ListFederatedExperimentComponent;
  let fixture: ComponentFixture<ListFederatedExperimentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListFederatedExperimentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListFederatedExperimentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
