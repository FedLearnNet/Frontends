import {BaseDto} from "@shared-lib/base/base-dto";
import {ColumnProfile} from "@shared-lib/modules/files/dto/file";
import {ConnectorRunDTO} from "./run";

export interface UploadInfoDTO {
  sheet?: string;
  json: string;
  data: any[];
  columns: string[];
  renamedColumns: string[];
  deletedColumns: boolean[];
  lastUploaded?: string;
  fileExists?: boolean;
  columnProfiles?: ColumnProfile[];
}

export interface UploadInfoView {
  json: any[];
  columns: string[];
  renamedColumns: string[];
  deletedColumns: boolean[];
  lastUploaded?: string;
  fileExists?: boolean;
}

export interface UploadInfoDialog {
  columnName: string;
  renamedColumn: string;
  deleted: boolean;
}

export interface ConnectorFilesDTO extends BaseDto {
  fileName: string;
  contentType: string;
  secret?: string;
  downloadUrl: string;
  size: number;
  isSupportFile?: boolean;
  cohortId?: number;
  connectorId?: number;
  uploadSettings?: FileParsingSettingsDTO;
}

export interface FileParsingSettingsDTO {
  fileType: 'EXCEL' | 'CSV' | 'JSON' | 'MULTIPLE_CSV_ZIP';
  delimiter: ',' | '|' | ';' | 's' | '\t' | 'CUSTOM';
  customDelimiter?: string;
  hasHeader: boolean;
  firstSheetOnly: boolean;
}

export interface ConnectorFileUploadSettingsDTO extends FileParsingSettingsDTO {
  hasSupportFile: boolean;
  deleteUnneededFileAfterSuccess: boolean;
  supportFile: boolean;
  previewRows: number;
}

export interface ConnectorFileImportResultDTO {
  files: ConnectorFilesDetailDTO[];
  accepted?: boolean;
  error?: {
    missingColumns?: string[];
    notFoundColumns?: string[];
    message?: string;
  },
}

export interface ConnectorFileUploadInfoDTO {
  sheet: string;
  json: string;
  columns: string[];
  renamedColumns: string[];
  deletedColumns: boolean[];
  columnProfiles: ColumnProfile[];
}

export interface ConnectorFilesDetailDTO extends ConnectorFilesDTO {
  uploadInfo: ConnectorFileUploadInfoDTO[];

  runs?: ConnectorRunDTO[];
  fileExists?: boolean;
}
