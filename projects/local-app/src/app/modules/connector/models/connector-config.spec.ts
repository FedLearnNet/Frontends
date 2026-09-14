import {
  configToConnectorConfigDTO,
  configToConnectorDraft,
  configToConnectorDTO,
  connectorDraftToConfig,
  connectorDTOToConfig
} from './connector-config';
import {ConnectorDTO, PivotMode, PivotValueFormat} from '../dto/connector';
import {connectorFilesDetailToFileInfo} from '../helper/connector-config-helper';
import {ConnectorFilesDetailDTO} from '../dto/upload-info';
import {ConnectorMappingMode} from './connector-value-mapping';

describe('connector config conversion', () => {
  const connector = {
    cohortId: 7,
    inputConfig: {
      mode: 'FILE',
      fileId: 11,
      fileType: 'EXCEL',
      firstSheetOnly: false,
      hasHeader: true,
      delimiter: ',',
    },
    pivotConfig: {
      valueColumnIndex: {
        Demographics: 1,
        Observations: 3,
      },
      mode: {Observations: PivotMode.ONE_HOT},
      prefix: {Observations: 'lab_'},
      valueFormat: {Observations: PivotValueFormat.ONE_ZERO},
    }
  } as unknown as ConnectorDTO;

  it('serializes pivot configuration for save and normal preview requests', () => {
    expect(configToConnectorDTO(connector).pivotConfig).toEqual(connector.pivotConfig);
    expect(configToConnectorConfigDTO(connector).pivotConfig).toEqual(connector.pivotConfig);
  });

  it('deserializes and preserves pivot configuration while editing', () => {
    const hydrated = connectorDTOToConfig(connector);

    expect(hydrated.pivotConfig).toEqual(connector.pivotConfig);
    expect(hydrated.pivotConfig).not.toBe(connector.pivotConfig);
    expect(hydrated.pivotConfig?.valueColumnIndex).not.toBe(connector.pivotConfig?.valueColumnIndex);
  });

  it('omits an empty pivot configuration', () => {
    const withoutPivot = {
      ...connector,
      pivotConfig: {valueColumnIndex: {}}
    };

    expect(configToConnectorDTO(withoutPivot).pivotConfig).toBeUndefined();
    expect(configToConnectorConfigDTO(withoutPivot).pivotConfig).toBeUndefined();
  });

  it('serializes advanced value mappings without UI validation details', () => {
    const withValueMapping = {
      ...connector,
      schemaMapping: [{
        column: 'code',
        valueMappingConfig: {
          mode: ConnectorMappingMode.VALUE_COLUMN,
          mappingColumn: 'code',
          valueColumn: 'measurement',
          valueMappings: [{
            sourceValue: 'heart_rate',
            displayValue: 'Vitals > Heart rate',
            value: 'Vitals.Heart rate',
            schemaId: 42,
          }],
          validationSummary: {valid: true, examples: []},
        }
      }]
    } as ConnectorDTO;

    expect(configToConnectorDTO(withValueMapping).schemaMapping?.[0].valueMappingConfig).toEqual({
      mode: ConnectorMappingMode.VALUE_COLUMN,
      mappingColumn: 'code',
      valueColumn: 'measurement',
      valueMappings: [{
        sourceValue: 'heart_rate',
        displayValue: 'Vitals > Heart rate',
        value: 'Vitals.Heart rate',
        schemaId: 42,
      }],
    });
  });

  it('serializes and restores one-hot mappings', () => {
    const oneHotMapping = {
      ...connector,
      schemaMapping: [{
        column: 'diagnosis',
        valueMappingConfig: {
          mode: ConnectorMappingMode.ONE_HOT,
          mappingColumn: 'diagnosis',
          valueColumn: 'diagnosis',
          valueMappings: [{
            sourceValue: 'V707',
            displayValue: 'Diagnoses > V707 present',
            value: 'Diagnoses.V707 present',
            schemaId: 71,
          }],
        }
      }]
    } as ConnectorDTO;

    const serialized = configToConnectorDTO(oneHotMapping);
    expect(serialized.schemaMapping?.[0].valueMappingConfig?.mode).toBe(ConnectorMappingMode.ONE_HOT);
    expect(serialized.schemaMapping?.[0].valueMappingConfig?.valueMappings[0]).toEqual({
      sourceValue: 'V707',
      displayValue: 'Diagnoses > V707 present',
      value: 'Diagnoses.V707 present',
      schemaId: 71,
    });

    expect(connectorDTOToConfig(serialized).schemaMapping?.[0].valueMappingConfig).toEqual(
      serialized.schemaMapping?.[0].valueMappingConfig
    );
  });

  it('uses the real file name for a single table with only a default numeric key', () => {
    const fileInfo = connectorFilesDetailToFileInfo({
      fileName: 'patients.csv',
      uploadInfo: [{
        sheet: '0',
        json: '[]',
        columns: ['patientId', 'field'],
        renamedColumns: ['patientId', 'field'],
        deletedColumns: [false, false],
        columnProfiles: [],
      }]
    } as unknown as ConnectorFilesDetailDTO);

    expect(Object.keys(fileInfo)).toEqual(['patients.csv']);
  });

  it('stores a compact browser draft and rehydrates preview rows', () => {
    const previewRows = [{patientId: 'patient-001', diagnosis: 'A'}];
    const fileInfo = {
      'patients.csv': {
        sheet: 'patients.csv',
        json: JSON.stringify(previewRows),
        data: previewRows,
        columns: ['patientId', 'diagnosis'],
        renamedColumns: ['patientId', 'diagnosis'],
        deletedColumns: [false, false],
        columnProfiles: [{
          name: 'diagnosis',
          type: 'TEXT',
          count: 100000,
          missing: 0,
          uniqueValues: 100000,
          valueCounts: [['A', 1]],
        }],
      }
    };
    const source = {
      ...connector,
      fileInfo,
      uploadInfo: fileInfo,
    } as unknown as ConnectorDTO;

    const stored = JSON.parse(JSON.stringify(configToConnectorDraft(source))) as ConnectorDTO;

    expect(stored.uploadInfo).toBeUndefined();
    expect(stored.fileInfo?.['patients.csv'].data).toBeUndefined();
    expect(stored.fileInfo?.['patients.csv'].columnProfiles).toBeUndefined();

    const restored = connectorDraftToConfig(stored);
    expect(restored.fileInfo?.['patients.csv'].data).toEqual(previewRows);
    expect(restored.fileInfo?.['patients.csv'].columnProfiles).toBeUndefined();
    expect(restored.uploadInfo).toBe(restored.fileInfo);
  });
});
