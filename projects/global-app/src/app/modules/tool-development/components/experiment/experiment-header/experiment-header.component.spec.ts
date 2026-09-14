import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExperimentHeaderComponent } from './experiment-header.component';

describe('ExperimentHeaderComponent', () => {
  let component: ExperimentHeaderComponent;
  let fixture: ComponentFixture<ExperimentHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExperimentHeaderComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExperimentHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
