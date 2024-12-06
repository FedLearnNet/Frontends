import {ConnectorInputConfig} from "../models/input-config";
import {ConnectorConfig} from "../models/connector-config";


export interface FileUploadSettingsDTO extends ConnectorInputConfig {
  filePath?: string;
  fileType: 'EXCEL' | 'CSV' | 'JSON';
  delimiter: ',' | '|' | ';' | 's' | '\t' | 'CUSTOM';
  customDelimiter?: string;
  hasHeader: boolean;
  extractSheets: 'ENTIRE' | 'SPECIFIC';
  specificSheets?: string;
  mergeType: 'HORIZONTALLY' | 'VERTICALLY';
}

export interface UploadInfoDTO {
  columns: string[]
  renamedColumns: string[]
  deletedColumns: boolean[]
  lastUploaded?: string
}

export interface FunctionsDetailDTO {
  module: string;
  method_name: string;
  input_mapping?: string;
  return_mapping?: string;
  column?: string;
  on_row?: boolean;
  for_list?: boolean;
}

export interface ConnectorConfigDTO {
  schema_id?: string
  input_config?: FileUploadSettingsDTO
  file_info?: UploadInfoDTO
  transformer?: FunctionsDetailDTO[]
}

export interface PreviewResponseDTO {
  jsons: string[]
}


export function configToPreviewDTO(config: ConnectorConfig): ConnectorConfigDTO {
  if (!config.inputConfig) throw new Error('input_config is required')
  if (!config.fileInfo) throw new Error('file_info is required')

  const input_config = {
    mode: config.inputConfig.mode,
    filePath: config.inputConfig.filePath,
    fileType: config.inputConfig.fileType,
    delimiter: config.inputConfig.delimiter,
    customDelimiter: config.inputConfig.customDelimiter,
    hasHeader: config.inputConfig.hasHeader,
    extractSheets: config.inputConfig.extractSheets,
    specificSheets: config.inputConfig.specificSheets,
    mergeType: config.inputConfig.mergeType,
  }
  const file_info = {
    renamedColumns: config.fileInfo.renamedColumns,
    deletedColumns: config.fileInfo.deletedColumns,
    columns: config.fileInfo.columns,
  }
  return {
    input_config: input_config,
    file_info: file_info,
    transformer: config.transformer?.map((f) => {
      return {
        id: 1,
        module: f.module,
        method_name: f.methodName,
        input_mapping: JSON.stringify(f.inputMapping),
        return_mapping: JSON.stringify(f.returnMapping),
        column: f.column,
        on_row: f.onRow,
        for_list: f.forList,
      }
    })
  }
}


