import {BaseDto} from "@shared-lib/base/base-dto";

export enum RevisionType {
  ADD, MOD, DEL
}

export interface PatientDataTraceabilityLogDto {
  id: string;
  cohortId?: number;
  internalPatientId: number;
  revId: number;
  dataEntriesVersion: number;
  createdAt: Date;
  patientId: string;
  userId: string | null;
  connectorId: number | null;
  runId: number | null;
  dryRun: boolean;
  committed: boolean;
}

export interface PatientDataChangeLogDto {
  revId: number,
  changeType: RevisionType;

  schemaNodeId: number;
  propertyName: string;
  previousData: any;
  currentData: any;
}

export interface PatientDataTraceabilityDetailLogDto extends PatientDataTraceabilityLogDto {
  changes: PatientDataChangeLogDto[];
}


export interface PatientQueryLogDto extends BaseDto {
  patientId: string;
  cohortId: number;
  queryId: number;
}

export interface RunStatisticsDto {
  deletedEntities: number;
  failedDataEntries: number;
  failedEntities: number;
  newDataEntries: number;
  newEntities: number;
  receivedEntities: number;
  unchangedEntities: number;
  updatedEntities: number;
  transferIdentification: {
    cohortId: number;
    connectorId: number;
    importId: number;
  };
}
