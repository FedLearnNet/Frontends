import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConnectorDynamicTableComponent } from './dynamic-table.component';

describe('ConnectorDynamicTableComponent', () => {
  let component: ConnectorDynamicTableComponent;
  let fixture: ComponentFixture<ConnectorDynamicTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConnectorDynamicTableComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConnectorDynamicTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('renews its columns in the given data column order, also for number-like names', () => {
    fixture.componentRef.setInput('renewColumns', true);
    fixture.componentRef.setInput('dataColumns', ['patient_id', '2019', 'sex']);
    // A row object lists "2019" first, so its keys cannot give the order.
    fixture.componentRef.setInput('data', [{patient_id: 'p1', '2019': 5, sex: 'f'}]);
    fixture.detectChanges();

    expect(component.columns()).toEqual(['patient_id', '2019', 'sex']);
    expect(component.renamedColumns()).toEqual(['patient_id', '2019', 'sex']);
  });
});
