import {ConnectorMappingValidationSummary, ConnectorValueMappingConfig} from './connector-value-mapping';

export interface ConnectorMappingElement {
  column: string;
  data: string;
  mapping: string;
  validation: string;
  mappingConfig?: {
    displayValue: string;
    value: string;
    schemaId?: number;
  };
  valueMappingConfig?: ConnectorValueMappingConfig;
  validationSummary?: ConnectorMappingValidationSummary;
  visitIdMapping?: string | null;
  visitTimestampMapping?: string | null;
  visitTimestampFormat?: string | null;

  disabled?: boolean;
}
