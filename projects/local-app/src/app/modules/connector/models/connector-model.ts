import {ConnectorMappingValidationSummary, ConnectorValueMappingConfig} from './connector-value-mapping';

export interface ConnectorMappingConfig{
  column: string;
  mapping?: string;
  schemaId?: number;
  visitTimestampMapping?: string;
  visitIdMapping?: string;
  timestampFormat?: string;
  /** UI-only preview validation; omitted from the connector API DTO. */
  validationSummary?: ConnectorMappingValidationSummary;
  valueMappingConfig?: ConnectorValueMappingConfig;
}
