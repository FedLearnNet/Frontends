import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListLocalExperimentComponent } from './list-local-experiment.component';

describe('ListLocalExperimentComponent', () => {
  let component: ListLocalExperimentComponent;
  let fixture: ComponentFixture<ListLocalExperimentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListLocalExperimentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListLocalExperimentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
