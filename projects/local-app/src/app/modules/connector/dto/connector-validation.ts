import {
  ConnectorInputConfigDTO,
  ConnectorMappingDTO,
  ConnectorTransformerDTO,
  PivotConfigDTO,
  SheetMergeResultDTO
} from './connector';
import {FunctionsDetailDTO} from './function';
import {UploadInfoDTO} from './upload-info';

export interface ConnectorValidationBulkRequestDTO {
  schemaId?: number;
  mapping?: string;
  value?: unknown;
  values?: unknown[];
}

export interface ConnectorValidationResultDTO {
  message: string;
  schemaId?: number;
  valid: boolean;
}

export interface PreviewValidationRequestElementDTO {
  schemaId?: number;
  mapping?: string;
}

export interface PreviewValidationRequestDTO {
  elements?: PreviewValidationRequestElementDTO[];
  cohortId?: number;
  inputConfig?: ConnectorInputConfigDTO;
  uploadInfo?: Record<string, UploadInfoDTO>;
  schemaMapping?: ConnectorMappingDTO[];
  mergeConfig?: SheetMergeResultDTO;
  pivotConfig?: PivotConfigDTO;
  transformer?: Array<ConnectorTransformerDTO | FunctionsDetailDTO>;
}

export interface PreviewValidationResponseElementDTO {
  value: string;
  validated: boolean;
  mapped: boolean;
  result?: ConnectorValidationResultDTO | null;
}

export type PreviewValidationWarningType =
  | 'TRANSFORMED_MAPPING_KEY'
  | 'MULTIPLE_MAPPING_KEYS'
  | 'APP_TRANSFORMER_OUTPUT';

export interface PreviewValidationWarningDTO {
  type: PreviewValidationWarningType;
  message: string;
}

export interface PreviewValidationResponseDTO {
  column: string;
  checks: PreviewValidationResponseElementDTO[];
  warnings: PreviewValidationWarningDTO[] | null;
}
