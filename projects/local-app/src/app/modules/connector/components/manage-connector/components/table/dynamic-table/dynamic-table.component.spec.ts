import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { TranslateModule } from '@ngx-translate/core';
import { MatSelect } from '@angular/material/select';
import { MatSlideToggle } from '@angular/material/slide-toggle';

import { ConnectorDynamicTableComponent } from './dynamic-table.component';
import { ConnectorPreviewSettingsService } from '../../../../../services/connector-preview-settings.service';

describe('ConnectorDynamicTableComponent', () => {
  let component: ConnectorDynamicTableComponent;
  let fixture: ComponentFixture<ConnectorDynamicTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConnectorDynamicTableComponent, TranslateModule.forRoot()]
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

  it('hides the preview controls unless asked for them', () => {
    expect(fixture.nativeElement.querySelector('.preview-controls')).toBeNull();
    expect(fixture.nativeElement.querySelector('.table-scroll.limited')).toBeNull();
  });

  it('shows the preview controls and updates the shared settings', () => {
    fixture.componentRef.setInput('showPreviewControls', true);
    fixture.detectChanges();
    const settings = TestBed.inject(ConnectorPreviewSettingsService);

    expect(fixture.nativeElement.querySelector('.preview-controls')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('.table-scroll.limited')).not.toBeNull();

    fixture.debugElement.query(By.directive(MatSelect)).triggerEventHandler('selectionChange', {value: 50});
    fixture.debugElement.query(By.directive(MatSlideToggle)).triggerEventHandler('change', {checked: true});

    expect(settings.rows()).toBe(50);
    expect(settings.preferNonEmpty()).toBeTrue();
  });
});
