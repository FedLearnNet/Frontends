export enum ConnectorMappingMode {
  DIRECT = 'DIRECT',
  VALUE_COLUMN = 'VALUE_COLUMN',
  ONE_HOT = 'ONE_HOT',
}

export interface ConnectorValueTarget {
  sourceValue: string;
  displayValue: string;
  value: string;
  schemaId: number;
}

export interface ConnectorMappingValidationExample {
  sourceLabel: string;
  targetLabel: string;
  targetPath: string;
  value: unknown;
  schemaId?: number;
  valid: boolean;
  missing?: boolean;
  message: string;
}

export interface ConnectorMappingValidationSummary {
  valid: boolean;
  examples: ConnectorMappingValidationExample[];
}

/** Mapping contract shared with the connector backend. */
export interface ConnectorValueMappingConfig {
  mode: ConnectorMappingMode.VALUE_COLUMN | ConnectorMappingMode.ONE_HOT;
  /** Column whose values select a schema target. For one-hot this is the row's column. */
  mappingColumn: string;
  /** Column that supplies the value written to the selected schema target. */
  valueColumn: string;
  valueMappings: ConnectorValueTarget[];
  validationSummary?: ConnectorMappingValidationSummary;
}
