import {RunMessageLogDTO} from "@shared-lib/modules/experiments/dto/log";

export type PatientToolRunStatus =
  'PENDING' | 'INITIALIZED' | 'STARTED' | 'RUNNING' | 'FINISHED' | 'STOPPED' | 'ERROR';

export interface PatientToolRunOutputDTO {
  key: string;
  fileName: string;
  type: string;
  size?: number;
}

export interface PatientToolRunStatusDTO {
  runId?: number;
  runStatus?: PatientToolRunStatus;
  progress?: number;
  lastError?: string;
  startedAt?: string;
  finishedAt?: string;
}

export interface PatientToolRunProgressDTO {
  runId?: number;
  status?: PatientToolRunStatusDTO;
  logs: RunMessageLogDTO[];
  outputs: PatientToolRunOutputDTO[];
  downloadReady: boolean;
}

export function isTerminalRunStatus(status?: PatientToolRunStatus): boolean {
  return status === 'FINISHED' || status === 'ERROR' || status === 'STOPPED';
}

/** A past app-based export of a cohort. */
export interface PatientToolRunSummaryDTO {
  id: number;
  appName?: string;
  image?: string;
  globalAPPVersionId?: number;
  runStatus: PatientToolRunStatus;
  lastError?: string;
  startedAt?: string;
  finishedAt?: string;
  hyperParams?: Record<string, unknown>;
  outputFileName?: string;
  outputSize?: number;
  downloadReady: boolean;
}
