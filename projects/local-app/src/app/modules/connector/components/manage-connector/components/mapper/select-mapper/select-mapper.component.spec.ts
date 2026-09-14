import {ComponentFixture, TestBed} from '@angular/core/testing';
import {signal} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import {TranslateModule} from '@ngx-translate/core';
import {of} from 'rxjs';

import {
  ConnectorSelectMapperComponent,
  ConnectorSelectMapperComponentData
} from './select-mapper.component';
import {DynamicFormService} from '@local-app/cohort/services/dynamic-form.service';
import {ConnectorPreviewService} from '../../../../../services/connector-preview.service';
import {ConnectorMappingMode} from '../../../../../models/connector-value-mapping';
import {SchemaNodeNestedDto, SchemaNodeTypeEnum} from '@local-app/cohort/dto/schema';

describe('ConnectorSelectMapperComponent', () => {
  let component: ConnectorSelectMapperComponent;
  let fixture: ComponentFixture<ConnectorSelectMapperComponent>;

  const data: ConnectorSelectMapperComponentData = {
    column: 'measurement',
    cohort: {
      id: 1,
      schemaRoot: {childNodes: []},
    } as unknown as ConnectorSelectMapperComponentData['cohort'],
    columns: ['measurement', 'patient_id', 'visit_type', 'mapped_column', 'hidden_column'],
    unavailableColumns: ['mapped_column', 'hidden_column'],
    rows: [],
    previewValidation: signal([{
      column: 'patient_id',
      checks: [
        {value: 'patient-001', mapped: false, validated: false},
        {value: 'patient-002', mapped: false, validated: false},
      ],
      warnings: null,
    }]),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConnectorSelectMapperComponent, TranslateModule.forRoot()],
      providers: [
        {provide: MAT_DIALOG_DATA, useValue: data},
        {provide: MatDialogRef, useValue: jasmine.createSpyObj<MatDialogRef<ConnectorSelectMapperComponent>>('MatDialogRef', ['close', 'updateSize'])},
        {provide: MatDialog, useValue: jasmine.createSpyObj<MatDialog>('MatDialog', ['open'])},
        {
          provide: DynamicFormService,
          useValue: {isNodeGroup: (node: SchemaNodeNestedDto) => node.nodeType === SchemaNodeTypeEnum.GROUP}
        },
        {provide: ConnectorPreviewService, useValue: {bulkTestValue: () => of([])}},
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ConnectorSelectMapperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('only offers visible columns which are not already taken', () => {
    expect(component.getAvailableMappingColumns()).toEqual(['patient_id', 'visit_type']);
  });

  it('filters key-column autocomplete options case-insensitively', () => {
    component.onMappingColumnSearchChange('VISIT');

    expect(component.getFilteredMappingColumns()).toEqual(['visit_type']);
  });

  it('keeps the current key column available while editing an existing mapping', () => {
    component.mappingColumn = 'mapped_column';
    component.mappingColumnSearch = '';

    expect(component.getAvailableMappingColumns()).toContain('mapped_column');
  });

  it('clears the selected key and its value mappings when a new search is entered', () => {
    component.mode = ConnectorMappingMode.VALUE_COLUMN;
    component.mappingColumn = 'patient_id';
    component.mappingColumnSearch = 'patient_id';
    component.valueMappings = [{
      sourceValue: '1',
      displayValue: 'Demographics > Age',
      value: 'Demographics.Age',
      schemaId: 12,
    }];

    component.onMappingColumnSearchChange('visit');

    expect(component.mappingColumn).toBe('');
    expect(component.valueMappings).toEqual([]);
    expect(component.mappingColumnSearch).toBe('visit');
  });

  it('uses possible values returned by preview validation', () => {
    component.mode = ConnectorMappingMode.VALUE_COLUMN;

    component.selectMappingColumn('patient_id');

    expect(component.sourceValueOptions).toEqual([
      {value: 'patient-001', label: 'patient-001'},
      {value: 'patient-002', label: 'patient-002'},
    ]);
    expect(component.usesPreviewValidationValues('patient_id')).toBeTrue();
  });

  it('finds nested schema elements and selects their complete parent path', () => {
    const systolic = schemaNode(3, 'Systolic pressure', SchemaNodeTypeEnum.ATTRIBUTE);
    const vitalSigns = schemaNode(2, 'Vital signs', SchemaNodeTypeEnum.GROUP, [systolic]);
    const clinical = schemaNode(1, 'Clinical', SchemaNodeTypeEnum.GROUP, [vitalSigns]);
    component.cohort = {
      id: 1,
      schemaRoot: {childNodes: [clinical]},
    } as unknown as ConnectorSelectMapperComponentData['cohort'];
    component.initializeFirstLevelOptions();
    component.searchTexts[0] = 'systolic';

    component.updateFilteredOptions(0);

    expect(component.filteredOptions[0].length).toBe(1);
    const result = component.filteredOptions[0][0];
    expect(component.getOptionPathLabel(result)).toBe('Clinical > Vital signs > Systolic pressure');
    expect(component.isChildSearchResult(0, result)).toBeTrue();

    component.onSelection(component.getOptionSelectionValue(result));

    expect(component.selectedValues).toEqual(['Clinical', 'Vital signs', 'Systolic pressure']);
    expect(component.getSelectedNode()).toBe(systolic);
  });

  it('renders and selects a synthetic schema option without an id', () => {
    const patientId = schemaNode(undefined, 'Unique Patient ID', SchemaNodeTypeEnum.ATTRIBUTE);
    component.cohort = {
      id: 1,
      schemaRoot: {childNodes: [patientId]},
    } as unknown as ConnectorSelectMapperComponentData['cohort'];
    component.initializeFirstLevelOptions();

    expect(() => fixture.detectChanges()).not.toThrow();

    const option = component.filteredOptions[0][0];
    component.onSelection(component.getOptionSelectionValue(option));

    expect(component.selectedValues).toEqual(['Unique Patient ID']);
    expect(component.getSelectedNode()).toBe(patientId);
  });

  function schemaNode(
    id: number | undefined,
    name: string,
    nodeType: SchemaNodeTypeEnum,
    childNodes: SchemaNodeNestedDto[] = []
  ): SchemaNodeNestedDto {
    return {id, name, nodeType, childNodes} as unknown as SchemaNodeNestedDto;
  }
});
