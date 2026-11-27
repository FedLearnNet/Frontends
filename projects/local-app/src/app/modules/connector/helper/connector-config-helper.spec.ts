import {fileFitsConnector, mergeConfigFitsTables, orderColumnsLikeHeaders} from './connector-config-helper';
import {UploadInfoDTO} from '../dto/upload-info';
import {ConnectorDTO, PivotMode, SheetMergeResultDTO} from '../dto/connector';

describe('orderColumnsLikeHeaders', () => {
  it('follows the Specify Headers order of the renamed columns', () => {
    const fileInfo = sheet(['Visit', '2019', 'Weight'], ['visit', '2019', 'weight_kg']);

    // A preview row's keys put integer-like names first.
    expect(orderColumnsLikeHeaders(['2019', 'visit', 'weight_kg'], fileInfo, undefined))
      .toEqual(['visit', '2019', 'weight_kg']);
  });

  it('puts the merge UID column first under its Specify Headers name', () => {
    const fileInfo = sheet(['age', 'Patient ID', 'weight'], ['age', 'PID', 'weight']);

    expect(orderColumnsLikeHeaders(['age', 'PID', 'weight'], fileInfo, mergedBy('Patient ID')))
      .toEqual(['PID', 'age', 'weight']);
  });

  it('puts the merge UID column first when the headers do not list it', () => {
    const fileInfo = sheet(['age', 'weight'], ['age', 'weight']);

    expect(orderColumnsLikeHeaders(['age', 'weight', 'Patient ID'], fileInfo, mergedBy('Patient ID')))
      .toEqual(['Patient ID', 'age', 'weight']);
  });

  it('lists columns a transformer created after the header columns, in their incoming order', () => {
    const fileInfo = sheet(['Patient ID', 'height', 'weight'], ['Patient ID', 'height', 'weight']);

    expect(orderColumnsLikeHeaders(
      ['weight', 'bmi', 'Patient ID', 'height', 'bmi_class'], fileInfo, mergedBy('Patient ID')
    )).toEqual(['Patient ID', 'height', 'weight', 'bmi', 'bmi_class']);
  });

  it('keeps the incoming order without header information', () => {
    expect(orderColumnsLikeHeaders(['weight', 'age'], undefined, undefined)).toEqual(['weight', 'age']);
  });
});

/**
 * A connector set up for the SUR sample ZIP (six CSVs merged by patient_id), given a replacement
 * file whose source file was deleted after a run. Same structure: the wizard carries on to the
 * mapper. Other structure: it stays on the file step.
 */
describe('fileFitsConnector', () => {
  const surTables = {
    SUR_demographics: ['patient_id', 'date_of_birth', 'sex', 'year of diagnosis'],
    SUR_medications: ['patient_id', 'start_date', 'brand_name', 'generic_name', 'times_per_day'],
    SUR_socioeconomics: ['patient_id', 'region', 'marital_status'],
  };
  const surConnector = connector({
    mergeConfig: {
      uidColumn: 'patient_id',
      commonUidColumnName: 'patient_id',
      sheetUidMapping: {SUR_demographics: 'patient_id', SUR_medications: 'patient_id', SUR_socioeconomics: 'patient_id'},
    },
    schemaMapping: [
      {column: 'patient_id', mapping: 'Unique Patient ID'},
      {column: 'brand_name', mapping: 'Medication.Brand name', visitTimestampMapping: 'start_date'},
      {column: 'region', mapping: 'Meta.Region'},
    ],
  });

  it('accepts the same tables and columns, in another order and with other values', () => {
    const reordered = {
      SUR_socioeconomics: ['marital_status', 'region', 'patient_id'],
      SUR_demographics: surTables.SUR_demographics,
      SUR_medications: surTables.SUR_medications,
    };

    expect(fileFitsConnector(surConnector, tables(reordered))).toBeTrue();
  });

  it('rejects other tables', () => {
    const restructured = tables({
      patients: ['PatientID', 'Gender', 'Region', 'MaritalStatusCode'],
      prescriptions: ['PatientID', 'Drug', 'From'],
      conditions: ['PatientID', 'SnomedCode'],
    });

    expect(fileFitsConnector(surConnector, restructured)).toBeFalse();
    expect(mergeConfigFitsTables(surConnector.mergeConfig!, restructured)).toBeFalse();
  });

  it('rejects a missing table', () => {
    const {SUR_socioeconomics: _, ...withoutOne} = surTables;

    expect(fileFitsConnector(surConnector, tables(withoutOne))).toBeFalse();
  });

  it('rejects a table without its merge UID column', () => {
    const changed = {...surTables, SUR_medications: ['PatientID', 'start_date', 'brand_name', 'times_per_day']};

    expect(fileFitsConnector(surConnector, tables(changed))).toBeFalse();
  });

  it('rejects a file without a mapped column, also a visit column', () => {
    expect(fileFitsConnector(surConnector, tables({...surTables, SUR_socioeconomics: ['patient_id', 'marital_status']})))
      .toBeFalse();
    expect(fileFitsConnector(surConnector, tables({...surTables, SUR_medications: ['patient_id', 'brand_name']})))
      .toBeFalse();
  });

  it('finds mapped columns under the names the merge gives columns several tables share', () => {
    const shared = {
      labs: ['patient_id', 'date', 'value'],
      vitals: ['patient_id', 'date', 'value'],
    };
    const merged = connector({
      mergeConfig: {uidColumn: 'patient_id', commonUidColumnName: 'patient_id', sheetUidMapping: {labs: 'patient_id', vitals: 'patient_id'}},
      schemaMapping: [{column: 'labs::value', mapping: 'Lab.Value', visitTimestampMapping: 'labs::date'}],
    });

    expect(fileFitsConnector(merged, tables(shared))).toBeTrue();
  });

  it('rejects several tables when the connector merges none', () => {
    const single = connector({schemaMapping: [{column: 'age', mapping: 'Meta.Age'}]});

    expect(fileFitsConnector(single, tables({a: ['age'], b: ['age']}))).toBeFalse();
  });

  it('checks the mapped columns of a single table', () => {
    const single = connector({schemaMapping: [{column: 'age', mapping: 'Meta.Age'}]});

    expect(fileFitsConnector(single, tables({'clinic.csv': ['id', 'age']}))).toBeTrue();
    expect(fileFitsConnector(single, tables({'clinic.csv': ['id', 'Age']}))).toBeFalse();
  });

  it('does not look for columns a transformer writes', () => {
    const transformed = connector({
      schemaMapping: [{column: 'bmi', mapping: 'Meta.BMI'}],
      transformer: [{moduleName: 'builtin', methodName: 'bmi', returnMapping: {bmi: 'bmi'}} as any],
    });

    expect(fileFitsConnector(transformed, tables({'clinic.csv': ['height', 'weight']}))).toBeTrue();
  });

  it('does not look for mapped columns when a pivot makes them', () => {
    const pivoted = connector({
      schemaMapping: [{column: 'HbA1c', mapping: 'Lab.HbA1c'}],
      pivotConfig: {valueColumnIndex: {'labs.csv': 2}, mode: {'labs.csv': PivotMode.TRANSPOSE}},
    });

    expect(fileFitsConnector(pivoted, tables({'labs.csv': ['id', 'name', 'value']}))).toBeTrue();
  });

  it('compares only the tables of a pivoted merge, whose UID column the pivot may make', () => {
    const pivoted = connector({
      mergeConfig: {uidColumn: 'pid', commonUidColumnName: 'pid', sheetUidMapping: {labs: 'pid', vitals: 'pid'}},
      pivotConfig: {valueColumnIndex: {labs: 2}},
    });

    expect(fileFitsConnector(pivoted, tables({labs: ['id', 'name', 'value'], vitals: ['id', 'value']}))).toBeTrue();
    expect(fileFitsConnector(pivoted, tables({panel: ['id', 'name', 'value'], vitals: ['id', 'value']}))).toBeFalse();
  });

  it('rejects a file without tables', () => {
    expect(fileFitsConnector(surConnector, {})).toBeFalse();
  });
});

function tables(columnsByTable: Record<string, string[]>): Record<string, UploadInfoDTO> {
  return Object.fromEntries(Object.entries(columnsByTable).map(([name, columns]) => [name, {
    sheet: name,
    json: '[]',
    data: [],
    columns,
    renamedColumns: [...columns],
    deletedColumns: columns.map(() => false),
  } as UploadInfoDTO]));
}

function connector(config: Partial<ConnectorDTO>): ConnectorDTO {
  return {id: 2, cohortId: 8, inputConfig: {mode: 'FILE'}, ...config} as ConnectorDTO;
}

function sheet(columns: string[], renamedColumns: string[]): Record<string, UploadInfoDTO> {
  return {
    Merged: {
      json: '[]',
      columns,
      renamedColumns,
      deletedColumns: columns.map(() => false),
    } as UploadInfoDTO,
  };
}

function mergedBy(commonUidColumnName: string): SheetMergeResultDTO {
  return {uidColumn: commonUidColumnName, sheetUidMapping: {}, commonUidColumnName};
}
