import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SimpleMetricLineComponent } from './simple-metric-line.component';

describe('SimpleMetricLineComponent', () => {
  let component: SimpleMetricLineComponent;
  let fixture: ComponentFixture<SimpleMetricLineComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SimpleMetricLineComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SimpleMetricLineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
