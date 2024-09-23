export interface UploadInfoDTO {
  json: string;
  data: any[];
  columns: string[];
  renamedColumns: string[];
  deletedColumns: boolean[];
}

export interface UploadInfoDialog {
  columnName: string;
  renamedColumn: string;
  deleted: boolean;
}
