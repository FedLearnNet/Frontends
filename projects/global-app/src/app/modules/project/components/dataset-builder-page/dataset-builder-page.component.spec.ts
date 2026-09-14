import {signal} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {MatSnackBar} from '@angular/material/snack-bar';
import {Router} from '@angular/router';
import {QueryStatisticsResponseService} from '@global-app/find-data/services/query-statistics-response.service';
import {QueryService} from '@global-app/find-data/services/query.service';
import {DataTypeService} from '@global-app/schema/services/datatype.service';
import {Store} from '@ngrx/store';
import {DatasetSelectionOption} from './dataset-builder.models';
import {DatasetBuilderPageComponent} from './dataset-builder-page.component';

describe('DatasetBuilderPageComponent', () => {
  let component: DatasetBuilderPageComponent;
  let fixture: ComponentFixture<DatasetBuilderPageComponent>;

  beforeEach(async () => {
    const store = {
      selectSignal: jasmine.createSpy('selectSignal').and.returnValues(signal(null), signal(false)),
      dispatch: jasmine.createSpy('dispatch'),
    };

    await TestBed.configureTestingModule({
      imports: [DatasetBuilderPageComponent],
      providers: [
        {provide: Store, useValue: store},
        {provide: Router, useValue: {navigate: jasmine.createSpy('navigate')}},
        {provide: MatSnackBar, useValue: {open: jasmine.createSpy('open')}},
        {provide: QueryService, useValue: {}},
        {provide: DataTypeService, useValue: {}},
        {provide: QueryStatisticsResponseService, useValue: {}},
      ],
    })
      .overrideComponent(DatasetBuilderPageComponent, {set: {template: ''}})
      .compileComponents();

    fixture = TestBed.createComponent(DatasetBuilderPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('keeps the feature identity stable and accepts an empty name while editing', () => {
    component.datasetFeatures.set([{
      name: 'BMI',
      order: 0,
      allowedDataIds: [],
    }]);
    const trackingKey = component.trackFeature(0, component.features()[0]);

    component.renameFeature(0, '');

    expect(component.features()[0].name).toBe('');
    expect(component.trackFeature(0, component.features()[0])).toBe(trackingKey);
  });

  it('keeps creating features from the layout drop target after the first drop', () => {
    const selection = {
      key: 'ontology-1::datatype-1',
      selection: {
        globalOntologyId: 'ontology-1',
        globalDataTypeId: 'datatype-1',
      },
      dataTypeName: 'BMI',
      dataTypeId: 'datatype-1',
    } as DatasetSelectionOption;
    const event = {
      dataTransfer: {
        effectAllowed: 'none',
        dropEffect: 'none',
        setData: jasmine.createSpy('setData'),
        getData: jasmine.createSpy('getData').and.returnValue(''),
      },
      preventDefault: jasmine.createSpy('preventDefault'),
      stopPropagation: jasmine.createSpy('stopPropagation'),
    } as unknown as DragEvent;

    component.startSelectionDrag(selection, event);
    component.createFeatureFromDrop(event);

    expect(component.features().length).toBe(1);
    expect(component.features()[0].name).toBe('BMI');
    expect(component.features()[0].allowedDataIds).toEqual([selection.selection]);
    expect(component.featureCreationDropLabel()).toContain('create another feature');

    const secondSelection = {
      ...selection,
      key: 'ontology-2::datatype-2',
      selection: {
        globalOntologyId: 'ontology-2',
        globalDataTypeId: 'datatype-2',
      },
      dataTypeName: 'Age',
      dataTypeId: 'datatype-2',
    };
    component.startSelectionDrag(secondSelection, event);
    component.createFeatureFromDrop(event);

    expect(component.features().length).toBe(2);
    expect(component.features()[1].name).toBe('Age');
    expect(event.preventDefault).toHaveBeenCalled();
    expect(event.stopPropagation).toHaveBeenCalled();
  });
});
