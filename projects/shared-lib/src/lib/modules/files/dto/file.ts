import {BaseAuthDto} from "@shared-lib/base/base-dto";


export interface FileDTO extends BaseAuthDto {
  fileName: string;
  contentType: string;
  size: number;
  secret: string;
}

export interface FileRenameDTO {
  fileName: string;
}

export interface FileContentDTO {
  content: string;
  type: 'CSV' | 'TSV' | 'JSON' | 'TEXT' | string; // FederatedAppConfigDataType
}

export interface ColumnProfile {
  name: string;
  type: string;
  count: number;
  missing: number;
  uniqueValues?: number;
  mean?: number;
  std?: number;
  min?: number;
  p25?: number;
  median?: number;
  p75?: number;
  max?: number;
  topCategories?: Array<[string, number]>;
//For connector
  valueCounts?: Array<[string, number] | { key: string; value: number }>;
}

export interface FileProfile {
  fileName: string;
  rowsScanned: number;
  columns: ColumnProfile[];
  sampleRows: string[];
}

export interface LocalFiles extends FileProfile {
  path: string;
}

export interface UploadFileProgress {
  progress: number;
  inProgress: boolean;
  result?: FileDTO;
}
