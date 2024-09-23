
export interface ConnectorMappingElement {
  column: string;
  data: string;
  mapping: string;
  validation: string;
  mappingConfig?: {
    displayValue: string,
    value: string,
    clearValueIfBlank: string
  };
}
