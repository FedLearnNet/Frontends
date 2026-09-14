export interface ConnectorInputConfig {
  mode: 'FILE' | 'FTP' | 'FUNCTION' | 'APP';
  fileId?: number | null;
}

export interface FileUploadSettings extends ConnectorInputConfig {
  file: File | null;
  fileType: 'EXCEL' | 'CSV' | 'JSON' | 'ZIP';
  hasSupportFile?: boolean;
  delimiter: ',' | '|' | ';' | 's' | '\t' | 'CUSTOM';
  customDelimiter?: string;
  hasHeader: boolean;
  firstSheetOnly: boolean;

  deleteUnneededFileAfterSuccess?: boolean;

  //only for getting obj from BE
  fileExists?: boolean;
}

export interface AppBasedUploadSettings extends ConnectorInputConfig {
  hyperParams: { [key: string]: string };
  inputData: { [p: string]: any };
  appImage: string;
  appVersionId: number;
  appTitle: string;
  outputParams?: { [outputName: string]: number };
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
