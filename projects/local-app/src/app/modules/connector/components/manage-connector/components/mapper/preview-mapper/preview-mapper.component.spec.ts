import {ComponentFixture, TestBed} from '@angular/core/testing';

import {ConnectorPreviewMapperComponent} from './preview-mapper.component';
import {ConnectorMappingMode} from '../../../../../models/connector-value-mapping';
import {CohortDetailDto} from '@local-app/cohort/models';
import {SchemaNodeNestedDto, SchemaNodeTypeEnum} from '@local-app/cohort/dto/schema';

describe('PreviewMapperComponent', () => {
  let component: ConnectorPreviewMapperComponent;
  let fixture: ComponentFixture<ConnectorPreviewMapperComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConnectorPreviewMapperComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(ConnectorPreviewMapperComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('cohort', {
      schemaRoot: {childNodes: []}
    } as unknown as CohortDetailDto);
    fixture.componentRef.setInput('mappingConfig', []);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component);
  });

  it('shows routed-column and one-hot mappings with their source semantics', () => {
    const target = {
      id: 42,
      name: 'Diabetes',
      globalId: 'diagnosis.Diabetes',
      nodeType: SchemaNodeTypeEnum.ATTRIBUTE,
      childNodes: [],
    } as unknown as SchemaNodeNestedDto;
    fixture.componentRef.setInput('mappingConfig', [
      {
        column: 'icd_code',
        data: '',
        mapping: '',
        validation: '',
        valueMappingConfig: {
          mode: ConnectorMappingMode.ONE_HOT,
          mappingColumn: 'icd_code',
          valueColumn: 'icd_code',
          valueMappings: [{
            sourceValue: 'E11',
            displayValue: 'Diagnosis > Diabetes',
            value: 'Diagnosis.Diabetes',
            schemaId: 42,
          }],
        },
      },
      {
        column: 'diagnosis_value',
        data: '',
        mapping: '',
        validation: '',
        valueMappingConfig: {
          mode: ConnectorMappingMode.VALUE_COLUMN,
          mappingColumn: 'diagnosis_type',
          valueColumn: 'diagnosis_value',
          valueMappings: [{
            sourceValue: 'diabetes',
            displayValue: 'Diagnosis > Diabetes',
            value: 'Diagnosis.Diabetes',
            schemaId: 42,
          }],
        },
      },
    ]);

    const entries = (component as any).getMappingEntries(target);

    expect(entries).toEqual([
      jasmine.objectContaining({
        mode: ConnectorMappingMode.ONE_HOT,
        description: 'icd_code = E11',
      }),
      jasmine.objectContaining({
        mode: ConnectorMappingMode.VALUE_COLUMN,
        description: 'diagnosis_value via diagnosis_type = diabetes',
      }),
    ]);
  });

  it('includes list attributes in mapping coverage', () => {
    const listTarget = {
      id: 43,
      name: 'Diagnoses',
      globalId: 'diagnosis.Diagnoses',
      nodeType: SchemaNodeTypeEnum.LIST_ATTRIBUTE,
      childNodes: [],
    } as unknown as SchemaNodeNestedDto;
    fixture.componentRef.setInput('cohort', {
      schemaRoot: {childNodes: [listTarget]}
    } as unknown as CohortDetailDto);
    fixture.componentRef.setInput('mappingConfig', [{
      column: 'diagnosis',
      data: '',
      mapping: '',
      validation: '',
      mappingConfig: {
        displayValue: 'Diagnosis > Diagnoses',
        value: 'Diagnosis.Diagnoses',
        schemaId: 43,
      },
    }]);

    expect(component.previewStats()).toEqual(jasmine.objectContaining({total: 1, mapped: 1}));
  });
});
