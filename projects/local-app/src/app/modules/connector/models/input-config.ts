export interface ConnectorInputConfig {
  mode: 'FILE' | 'FTP' | 'FUNCTION';
}

export interface FileUploadSettings extends ConnectorInputConfig {
  file: File | null;
  filePath?: string;
  fileType: 'EXCEL' | 'CSV' | 'JSON';
  hasSupportFile?: boolean;
  delimiter: ',' | '|' | ';' | 's' | '\t' | 'CUSTOM';
  customDelimiter?: string;
  hasHeader: boolean;
  extractSheets: 'ENTIRE' | 'SPECIFIC';
  specificSheets?: string;
  mergeType: 'HORIZONTALLY' | 'VERTICALLY';
}

export interface FTPUploadSettings extends ConnectorInputConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  filePath: string;
  fileSettings: FileUploadSettings;
}

export interface FunctionUploadSettings extends ConnectorInputConfig {
  function: string;
  parameters: any;
}
