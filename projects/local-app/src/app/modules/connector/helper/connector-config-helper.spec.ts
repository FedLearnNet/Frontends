import {orderColumnsLikeHeaders} from './connector-config-helper';
import {UploadInfoDTO} from '../dto/upload-info';
import {SheetMergeResultDTO} from '../dto/connector';

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
