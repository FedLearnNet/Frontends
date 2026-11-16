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
  /** Rows the preview shows (display only, never saved). Omitted means 10. */
  previewRows?: number;
  /** Prefer rows that fill the most columns (display only, never saved). */
  previewNonEmpty?: boolean;
}

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
