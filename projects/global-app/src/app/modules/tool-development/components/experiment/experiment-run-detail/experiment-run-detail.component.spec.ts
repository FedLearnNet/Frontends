import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExperimentRunDetailComponent } from './experiment-run-detail.component';

describe('ExperimentRunDetailComponent', () => {
  let component: ExperimentRunDetailComponent;
  let fixture: ComponentFixture<ExperimentRunDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExperimentRunDetailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExperimentRunDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
