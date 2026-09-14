import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TimeSeriesMappingDialogComponent } from './time-series-mapping-dialog.component';

describe('TimeSeriesMappingDialogComponent', () => {
  let component: TimeSeriesMappingDialogComponent;
  let fixture: ComponentFixture<TimeSeriesMappingDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TimeSeriesMappingDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TimeSeriesMappingDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
