export interface UploadInfoDTO {
  json: string;
  data: any[];
  columns: string[];
  renamedColumns: string[];
  deletedColumns: boolean[];
  lastUploaded?: string;
}

export interface UploadInfoDialog {
  columnName: string;
  renamedColumn: string;
  deleted: boolean;
}

export interface ReUploadInfo {
  success?: boolean;
  error?: {
    missingColumns: string[];
    notFoundColumns: string[];
  }
}
