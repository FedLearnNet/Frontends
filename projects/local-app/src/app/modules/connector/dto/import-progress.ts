import {ColumnProfile} from '@shared-lib/modules/files/dto/file';

export interface ImportSheetDTO {
  sheet: string;
  json?: string;
  columns?: string[];
  renamedColumns?: string[];
  deletedColumns?: boolean[];
  columnProfiles?: ColumnProfile[];
}

export type ReuploadTableState = 'MATCHED' | 'CHANGED' | 'MISSING' | 'ADDED';

export interface ReuploadTableDiffDTO {
  name: string;
  state: ReuploadTableState;
  missingColumns?: string[];
  notFoundColumns?: string[];
}


export interface ImportRefusalDTO {
  message?: string;
  missingColumns?: string[];
  notFoundColumns?: string[];
  tables?: ReuploadTableDiffDTO[];
}


export interface ImportResultDTO<TFile = any> {
  files: TFile[];
  accepted?: boolean;
  error?: ImportRefusalDTO;
}

export type ImportPhase =
  'TRANSFER'
  | 'PARSING'
  | 'SAMPLING'
  | 'COMPARING'
  | 'SUCCEEDED'
  | 'REFUSED'
  | 'FAILED';

export const IMPORT_PHASE_ORDER: ImportPhase[] = ['TRANSFER', 'PARSING', 'SAMPLING', 'COMPARING'];

export function isImportFinished(phase: ImportPhase): boolean {
  return phase === 'SUCCEEDED' || phase === 'REFUSED' || phase === 'FAILED';
}

export type ImportTableState = 'PENDING' | 'READING' | 'READ' | 'SKIPPED' | 'FAILED';


export interface ImportTableDTO {
  name: string;
  position: number;
  total: number;
  state: ImportTableState;
  rows?: number;
  columns?: number;
  rowsPerSecond?: number;
  missingValues?: number;
  durationMs?: number;
  note?: string;
}

export interface ImportEventDTO {
  importId: string;
  phase: ImportPhase;
  at?: string;
  tables?: ImportTableDTO[];
  table?: ImportTableDTO;
  result?: ImportResultDTO;
  errorMessage?: string;
  last?: boolean;
}

export interface ImportProgressDTO {
  importId: string;
  cohortId?: number;
  connectorId?: number;
  fileName?: string;
  fileSize?: number;
  phase: ImportPhase;
  startedAt?: string;
  updatedAt?: string;
  finishedAt?: string;
  tables?: ImportTableDTO[];
  fileId?: number;
  accepted?: boolean;
  refusal?: ImportRefusalDTO;
  errorMessage?: string;
}

export interface ImportActivity {
  importId: string;
  cohortId: number;
  connectorId?: number;
  fileName: string;
  fileSize: number;
  phase: ImportPhase;
  transferred: number;
  transferPercent: number;
  tables: ImportTableDTO[];
  result?: ImportResultDTO;
  accepted?: boolean;
  refusal?: ImportRefusalDTO;
  error?: string;
  startedAt: number;
  finishedAt?: number;
}
