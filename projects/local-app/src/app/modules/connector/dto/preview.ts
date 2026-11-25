import {
  ConnectorInputConfigDTO,
  ConnectorMappingDTO,
  ConnectorTransformerDTO,
  PivotConfigDTO,
  SheetMergeResultDTO
} from './connector';

export interface ConnectorConfigDTO {
  connectorId?: number;
  cohortId?: number;
  inputConfig?: ConnectorInputConfigDTO;
  fileInfo?: unknown;
  transformer?: ConnectorTransformerDTO[];
  schemaMapping?: ConnectorMappingDTO[];
  mergeConfig?: SheetMergeResultDTO;
  pivotConfig?: PivotConfigDTO;
  /** Rows the preview shows (display only, never saved). */
  previewRows?: number;
}

export const DEFAULT_PREVIEW_ROWS = 10;
export const PREVIEW_ROW_OPTIONS = [10, 25, 50, 100] as const;

export interface PreviewStageDTO {
  stepIndex: number;
  transformerId?: number;
  transformerName?: string;
  cached: boolean;
  fingerprint?: string;
  cachedAt?: Date;
  rowCount?: number;
  appBased?: boolean;
  requiresRun?: boolean;
  blockedByStep?: number;
}

export interface PreviewResponseDTO {
  jsons: string[]
  columns?: string[][]
  stages?: PreviewStageDTO[]
}
