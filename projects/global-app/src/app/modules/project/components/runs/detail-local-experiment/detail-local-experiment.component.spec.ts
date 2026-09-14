import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailLocalExperimentComponent } from './detail-local-experiment.component';

describe('DetailLocalExperimentComponent', () => {
  let component: DetailLocalExperimentComponent;
  let fixture: ComponentFixture<DetailLocalExperimentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetailLocalExperimentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DetailLocalExperimentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
