import {ComponentFixture, TestBed} from '@angular/core/testing';

import {ConnectorEditMapperComponent} from './edit-mapper.component';
import {MatDialog} from '@angular/material/dialog';
import {ConnectorPreviewService} from '../../../../../services/connector-preview.service';
import {ActivatedRoute} from '@angular/router';
import {EMPTY, Observable, of, Subject, throwError} from 'rxjs';
import {ConnectorMappingMode} from '../../../../../models/connector-value-mapping';
import {ConnectorMappingElement} from '../../../../../models/connector-preview';
import {PreviewValidationResponseDTO, PreviewValidationWarningDTO} from '../../../../../dto/connector-validation';

describe('ConnectorEditMapperComponent', () => {
  let component: ConnectorEditMapperComponent;
  let fixture: ComponentFixture<ConnectorEditMapperComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConnectorEditMapperComponent],
      providers: [
        {
          provide: MatDialog,
          useValue: {open: jasmine.createSpy('open')}
        },
        {
          provide: ConnectorPreviewService,
          useValue: {
            bulkTestValue: jasmine.createSpy('bulkTestValue').and.returnValue(of([])),
            validatePreview: jasmine.createSpy('validatePreview').and.returnValue(EMPTY)
          }
        },
        {
          provide: ActivatedRoute,
          useValue: {
            data: of({
              cohort: {
                id: 1,
                schemaRoot: {
                  childNodes: []
                }
              }
            }),
            fragment: of(null)
          }
        }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConnectorEditMapperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('lists the field rows in the order of its columns, also when filtered', () => {
    component.dataSource.set([
      unmappedElement('Patient ID'),
      unmappedElement('weight'),
      mappedElement('height', 54),
      unmappedElement('lab::glucose'),
      mappedElement('age', 53),
    ]);

    expect(component.tableDataSource().map(element => element.column))
      .toEqual(['Patient ID', 'weight', 'height', 'lab::glucose', 'age']);

    component.filterMapped.set(['Mapped']);

    expect(component.tableDataSource().map(element => element.column)).toEqual(['height', 'age']);
  });

  it('should use the next non-empty row when the first sample value is null', () => {
    const value = (component as any).getSampleData([
      {age: null},
      {age: 42},
      {age: 99}
    ], 'age');

    expect(value).toBe(42);
  });

  it('should stop searching when the remaining preview rows are empty', () => {
    const value = (component as any).getSampleData([
      {age: null},
      {age: ''},
      {},
      {age: 42}
    ], 'age');

    expect(value).toBeNull();
  });

  it('uses the full preview validation endpoint for mapped columns', () => {
    const previewService = TestBed.inject(ConnectorPreviewService) as jasmine.SpyObj<ConnectorPreviewService>;
    previewService.validatePreview.calls.reset();
    fixture.componentRef.setInput('validationConfig', {
      cohortId: 1,
      inputConfig: {mode: 'FILE', fileId: 11, fileType: 'CSV', hasHeader: true},
      fileInfo: {'patients.csv': {sheet: 'patients.csv', json: '[]'}},
    });

    const elements: ConnectorMappingElement[] = [{
      column: 'age',
      data: '12',
      mapping: 'Demographics > Age',
      validation: 'Sync',
      mappingConfig: {
        displayValue: 'Demographics > Age',
        value: 'Demographics.Age',
        schemaId: 53,
      }
    }];
    component.dataSource.set(elements);
    component.validateColumns();

    expect(previewService.validatePreview).toHaveBeenCalledTimes(1);
    const request = previewService.validatePreview.calls.mostRecent().args[0];
    expect(request.cohortId).toBe(1);
    expect(request.inputConfig).toEqual(jasmine.objectContaining({fileId: 11}));
    expect(request.uploadInfo).toEqual(jasmine.objectContaining({
      'patients.csv': jasmine.objectContaining({sheet: 'patients.csv'})
    }));
    expect(request.schemaMapping).toEqual([jasmine.objectContaining({
      column: 'age',
      schemaId: 53,
      mapping: 'Demographics.Age',
    })]);
    expect(previewService.bulkTestValue).not.toHaveBeenCalled();
  });

  it('includes routed and one-hot mappings in preview validation', () => {
    const previewService = TestBed.inject(ConnectorPreviewService) as jasmine.SpyObj<ConnectorPreviewService>;
    previewService.validatePreview.calls.reset();
    fixture.componentRef.setInput('validationConfig', {
      cohortId: 1,
      inputConfig: {mode: 'FILE', fileId: 11, fileType: 'CSV', hasHeader: true},
    });

    const elements: ConnectorMappingElement[] = [
      {
        column: 'measurement',
        data: 'preview-only',
        mapping: '',
        validation: 'Sync',
        valueMappingConfig: {
          mode: ConnectorMappingMode.VALUE_COLUMN,
          mappingColumn: 'kind',
          valueColumn: 'measurement',
          valueMappings: [{
            sourceValue: 'A',
            displayValue: 'Measurements > A',
            value: 'Measurements.A',
            schemaId: 61,
          }],
        },
      },
      {
        column: 'kind',
        data: 'A',
        mapping: '',
        validation: 'Sync',
        valueMappingConfig: {
          mode: ConnectorMappingMode.ONE_HOT,
          mappingColumn: 'kind',
          valueColumn: 'kind',
          valueMappings: [{
            sourceValue: 'B',
            displayValue: 'Flags > B',
            value: 'Flags.B',
            schemaId: 62,
          }],
        },
      },
    ];
    component.dataSource.set(elements);
    component.validateColumns();

    const request = previewService.validatePreview.calls.mostRecent().args[0];
    expect(request.schemaMapping).toEqual([
      jasmine.objectContaining({
        column: 'measurement',
        valueMappingConfig: jasmine.objectContaining({
          mode: ConnectorMappingMode.VALUE_COLUMN,
          mappingColumn: 'kind',
          valueColumn: 'measurement',
        }),
      }),
      jasmine.objectContaining({
        column: 'kind',
        valueMappingConfig: jasmine.objectContaining({
          mode: ConnectorMappingMode.ONE_HOT,
          mappingColumn: 'kind',
          valueColumn: 'kind',
        }),
      }),
    ]);
  });

  it('uses response values and mapping flags in the validation summary', () => {
    const previewService = TestBed.inject(ConnectorPreviewService) as jasmine.SpyObj<ConnectorPreviewService>;
    const response = [{
      column: 'age',
      checks: [
        {value: '42', mapped: true, validated: true, result: {valid: true, message: 'Valid', schemaId: 53}},
        {value: '', mapped: true, validated: true, result: {valid: true, message: 'Valid', schemaId: 53}},
        {value: 'unknown', mapped: true, validated: false, result: null},
      ],
      warnings: null,
    }];
    previewService.validatePreview.and.returnValue(of(...response));
    fixture.componentRef.setInput('validationConfig', {
      cohortId: 1,
      inputConfig: {mode: 'FILE', fileId: 11, fileType: 'CSV', hasHeader: true},
    });
    component.dataSource.set([{
      column: 'age',
      data: '42',
      mapping: 'Demographics > Age',
      validation: 'Sync',
      mappingConfig: {
        displayValue: 'Demographics > Age',
        value: 'Demographics.Age',
        schemaId: 53,
      }
    }]);

    component.validateColumns();

    const summary = component.dataSource()[0].validationSummary!;
    expect(summary.examples.map(example => example.value)).toEqual(['42', '', 'unknown']);
    expect(summary.examples[0].valid).toBeTrue();
    expect(summary.examples[1]).toEqual(jasmine.objectContaining({
      valid: true,
      missing: true,
    }));
    expect(summary.examples[2]).toEqual(jasmine.objectContaining({
      valid: false,
      message: 'Value was not validated',
    }));
    expect(component.validationLoading()).toBeFalse();

    const dialog = TestBed.inject(MatDialog);
    (dialog.open as jasmine.Spy).and.returnValue({afterClosed: () => of(undefined)});
    component.viewSelectedColumn(component.dataSource()[0]);

    expect((dialog.open as jasmine.Spy).calls.mostRecent().args[1].data.previewValidation()).toEqual(response);
  });

  it('upserts placeholders and accepts untouched results before transformed results', () => {
    const previewService = TestBed.inject(ConnectorPreviewService) as jasmine.SpyObj<ConnectorPreviewService>;
    const stream = new Subject<PreviewValidationResponseDTO>();
    previewService.validatePreview.and.returnValue(stream);
    fixture.componentRef.setInput('validationConfig', {
      cohortId: 1,
      inputConfig: {mode: 'FILE', fileId: 11, fileType: 'CSV', hasHeader: true},
    });
    component.dataSource.set([
      mappedElement('age', 53),
      mappedElement('height', 54),
    ]);

    component.validateColumns();
    stream.next({column: 'age', checks: [], warnings: null});
    stream.next({column: 'height', checks: [], warnings: null});

    expect(component.validationLoading()).toBeFalse();
    expect(component.getValidationState(component.dataSource()[0])).toBe('SYNC');
    expect(component.getValidationState(component.dataSource()[1])).toBe('SYNC');

    const untouchedResult: PreviewValidationResponseDTO = {
      column: 'height',
      checks: [{
        value: '180',
        mapped: true,
        validated: true,
        result: {valid: true, message: 'Valid', schemaId: 54},
      }],
      warnings: [],
    };
    stream.next(untouchedResult);

    expect(component.getValidationState(component.dataSource()[0])).toBe('SYNC');
    expect(component.getValidationState(component.dataSource()[1])).toBe('VALID');

    const transformedResult: PreviewValidationResponseDTO = {
      column: 'age',
      checks: [{
        value: '42',
        mapped: true,
        validated: true,
        result: {valid: true, message: 'Valid', schemaId: 53},
      }],
      warnings: [{type: 'APP_TRANSFORMER_OUTPUT', message: 'Derived value'}],
    };
    stream.next(transformedResult);

    expect((component as any).previewValidationResults()).toEqual([
      transformedResult,
      untouchedResult,
    ]);
    expect(component.getColumnWarnings(component.dataSource()[0])).toEqual(transformedResult.warnings!);
    expect(component.getValidationState(component.dataSource()[0])).toBe('VALID');
    expect(component.getValidValidationIcon(component.dataSource()[0])).toBe('warning');
    expect(component.getValidValidationIcon(component.dataSource()[1])).toBe('verified');
  });

  it('keeps validation counts in sync with streamed row indicators', () => {
    const previewService = TestBed.inject(ConnectorPreviewService) as jasmine.SpyObj<ConnectorPreviewService>;
    const stream = new Subject<PreviewValidationResponseDTO>();
    previewService.validatePreview.and.returnValue(stream);
    fixture.componentRef.setInput('validationConfig', {
      cohortId: 1,
      inputConfig: {mode: 'FILE', fileId: 11, fileType: 'CSV', hasHeader: true},
    });
    const element = mappedElement('age', 53);
    element.validation = 'Valid';
    component.dataSource.set([element]);

    component.validateColumns();
    stream.next({column: 'age', checks: [], warnings: null});

    expect(component.getValidationState(element)).toBe('SYNC');
    expect(component.validCount()).toBe(0);
    expect(component.pendingCount()).toBe(1);

    stream.next({
      column: 'age',
      checks: [{
        value: '42',
        mapped: true,
        validated: true,
        result: {valid: true, message: 'Valid', schemaId: 53},
      }],
      warnings: [],
    });

    expect(component.getValidationState(component.dataSource()[0])).toBe('VALID');
    expect(component.validCount()).toBe(1);
    expect(component.pendingCount()).toBe(0);
  });

  it('clears placeholder loading on normal completion when final checks are empty', () => {
    const previewService = TestBed.inject(ConnectorPreviewService) as jasmine.SpyObj<ConnectorPreviewService>;
    const stream = new Subject<PreviewValidationResponseDTO>();
    previewService.validatePreview.and.returnValue(stream);
    fixture.componentRef.setInput('validationConfig', {
      cohortId: 1,
      inputConfig: {mode: 'FILE', fileId: 11, fileType: 'CSV', hasHeader: true},
    });
    component.dataSource.set([mappedElement('age', 53)]);

    component.validateColumns();
    stream.next({column: 'age', checks: [], warnings: null});
    expect(component.getValidationState(component.dataSource()[0])).toBe('SYNC');

    stream.complete();

    expect(component.validationLoading()).toBeFalse();
    expect(component.getValidationState(component.dataSource()[0])).toBe('VALID');
    expect(component.dataSource()[0].validationSummary).toEqual({valid: true, examples: []});
  });

  it('cancels the previous validation stream when a new validation starts', () => {
    const previewService = TestBed.inject(ConnectorPreviewService) as jasmine.SpyObj<ConnectorPreviewService>;
    const firstTeardown = jasmine.createSpy('firstTeardown');
    const firstStream = new Observable<PreviewValidationResponseDTO>(() => firstTeardown);
    const secondStream = new Subject<PreviewValidationResponseDTO>();
    previewService.validatePreview.and.returnValues(firstStream, secondStream);
    fixture.componentRef.setInput('validationConfig', {
      cohortId: 1,
      inputConfig: {mode: 'FILE', fileId: 11, fileType: 'CSV', hasHeader: true},
    });
    component.dataSource.set([mappedElement('age', 53)]);
    component.validateColumns();

    fixture.componentRef.setInput('validationConfig', {
      cohortId: 1,
      inputConfig: {mode: 'FILE', fileId: 12, fileType: 'CSV', hasHeader: true},
    });
    component.validateColumns();

    expect(firstTeardown).toHaveBeenCalled();
    expect(previewService.validatePreview).toHaveBeenCalledTimes(2);
  });

  it('cancels the validation stream when the component is destroyed', () => {
    const previewService = TestBed.inject(ConnectorPreviewService) as jasmine.SpyObj<ConnectorPreviewService>;
    const teardown = jasmine.createSpy('teardown');
    previewService.validatePreview.and.returnValue(new Observable<PreviewValidationResponseDTO>(() => teardown));
    fixture.componentRef.setInput('validationConfig', {
      cohortId: 1,
      inputConfig: {mode: 'FILE', fileId: 11, fileType: 'CSV', hasHeader: true},
    });
    component.dataSource.set([mappedElement('age', 53)]);
    component.validateColumns();

    fixture.destroy();

    expect(teardown).toHaveBeenCalled();
  });

  it('releases the initial skeleton when preview validation fails', () => {
    const previewService = TestBed.inject(ConnectorPreviewService) as jasmine.SpyObj<ConnectorPreviewService>;
    previewService.validatePreview.and.returnValue(throwError(() => new Error('validation failed')));
    fixture.componentRef.setInput('validationConfig', {
      cohortId: 1,
      inputConfig: {mode: 'FILE', fileId: 11, fileType: 'CSV', hasHeader: true},
    });

    component.validateColumns();

    expect(component.validationLoading()).toBeFalse();
  });

  it('keeps both streamed columns in a value-column owner summary', () => {
    const previewService = TestBed.inject(ConnectorPreviewService) as jasmine.SpyObj<ConnectorPreviewService>;
    const stream = new Subject<PreviewValidationResponseDTO>();
    previewService.validatePreview.and.returnValue(stream);
    fixture.componentRef.setInput('validationConfig', {
      cohortId: 1,
      inputConfig: {mode: 'FILE', fileId: 11, fileType: 'CSV', hasHeader: true},
    });
    component.dataSource.set([
      {
        column: 'kind',
        data: 'A',
        mapping: '1 value route measurement',
        validation: 'Sync',
        valueMappingConfig: {
          mode: ConnectorMappingMode.VALUE_COLUMN,
          mappingColumn: 'kind',
          valueColumn: 'measurement',
          valueMappings: [{
            sourceValue: 'A',
            displayValue: 'Measurements > A',
            value: 'Measurements.A',
            schemaId: 61,
          }],
        },
      },
      {column: 'measurement', data: '7', mapping: 'Routed by kind', validation: ''},
      mappedElement('age', 53),
    ]);

    component.validateColumns();
    ['kind', 'measurement', 'age'].forEach(column => stream.next({column, checks: [], warnings: null}));
    stream.next({
      column: 'kind',
      checks: [{value: 'A', mapped: true, validated: true, result: {valid: true, message: 'Valid', schemaId: 61}}],
      warnings: [],
    });
    stream.next({
      column: 'measurement',
      checks: [{value: '7', mapped: true, validated: true, result: {valid: true, message: 'Valid', schemaId: 61}}],
      warnings: [],
    });
    const ownerSummaryBeforeUnrelatedResult = component.dataSource()[0].validationSummary!;
    expect(ownerSummaryBeforeUnrelatedResult.examples.map(example => [example.sourceLabel, example.value]))
      .toEqual([['kind', 'A'], ['measurement', '7']]);
    stream.next({
      column: 'age',
      checks: [{value: '42', mapped: true, validated: true, result: {valid: true, message: 'Valid', schemaId: 53}}],
      warnings: [],
    });
    expect(component.dataSource()[0].validationSummary).toBe(ownerSummaryBeforeUnrelatedResult);
    stream.complete();

    const [owner, valueSource, age] = component.dataSource();
    expect(owner.validationSummary!.examples.map(example => [example.sourceLabel, example.value]))
      .toEqual([['kind', 'A'], ['measurement', '7']]);
    expect(owner.valueMappingConfig!.validationSummary).toBe(owner.validationSummary);
    expect(valueSource.validationSummary).toBeUndefined();
    expect(component.getValidationState(valueSource)).toBe('VALID');
    expect(age.validationSummary!.examples.map(example => example.value)).toEqual(['42']);
  });

  it('re-validates after a field is mapped in the mapping dialog, so its transformer warning shows', () => {
    const previewService = TestBed.inject(ConnectorPreviewService) as jasmine.SpyObj<ConnectorPreviewService>;
    fixture.componentRef.setInput('validationConfig', {
      cohortId: 1,
      inputConfig: {mode: 'FILE', fileId: 11, fileType: 'CSV', hasHeader: true},
    });
    fixture.componentRef.setInput('transformers', [{moduleName: 'm', methodName: 'double_age', column: 'age'} as any]);
    component.dataSource.set([unmappedElement('age')]);
    component.validateColumns();
    previewService.validatePreview.calls.reset();

    // The backend warns about a transformer output only once that column is also mapped.
    const warnings: PreviewValidationWarningDTO[] = [
      {type: 'TRANSFORMED_MAPPING_KEY', message: "Column 'age' is created or overwritten by a transformer"},
    ];
    previewService.validatePreview.and.returnValue(of({
      column: 'age',
      checks: [{value: '42', mapped: true, validated: true, result: {valid: true, message: 'Valid', schemaId: 53}}],
      warnings,
    }));
    (TestBed.inject(MatDialog).open as jasmine.Spy).and.returnValue({
      afterClosed: () => of({
        mode: ConnectorMappingMode.DIRECT,
        displayValue: 'Demographics > Age',
        value: 'Demographics.Age',
        schemaId: 53,
        validationSummary: {valid: true, examples: []},
      }),
    });

    component.viewSelectedColumn(component.dataSource()[0]);

    expect(previewService.validatePreview).toHaveBeenCalledTimes(1);
    expect(previewService.validatePreview.calls.mostRecent().args[0].schemaMapping)
      .toEqual([jasmine.objectContaining({column: 'age', mapping: 'Demographics.Age'})]);
    expect(component.getColumnWarnings(component.dataSource()[0])).toEqual(warnings);
    expect(component.getValidValidationIcon(component.dataSource()[0])).toBe('warning');
  });
});

function mappedElement(column: string, schemaId: number): ConnectorMappingElement {
  return {
    column,
    data: column === 'age' ? '42' : '180',
    mapping: `Demographics > ${column}`,
    validation: 'Sync',
    mappingConfig: {
      displayValue: `Demographics > ${column}`,
      value: `Demographics.${column}`,
      schemaId,
    },
  };
}

function unmappedElement(column: string): ConnectorMappingElement {
  return {column, data: '', mapping: 'Mapping', validation: ''};
}
