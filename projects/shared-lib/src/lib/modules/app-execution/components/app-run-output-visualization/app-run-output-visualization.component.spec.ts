import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppRunOutputVisualizationComponent } from './app-run-output-visualization.component';

describe('AppRunOutputVisualizationComponent', () => {
  let component: AppRunOutputVisualizationComponent;
  let fixture: ComponentFixture<AppRunOutputVisualizationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppRunOutputVisualizationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AppRunOutputVisualizationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
