export interface PatientDataTraceabilityLogDto {
  id: string;
  patientId: string;
  prevVersion: number;
  currentVersion: number;
  previousData: string;
  currentData: string;
  userId: string | null;
  connectorId: string | null;
  runId: string | null;
  dryRun: boolean;
  committed: boolean;
  createdAt: string;
}


export interface PatientQueryLogDto {
  id: string;
  patientId: string;
  cohortId: string;
  queryId: string;
  userId: string | null;
  createdAt: string;
}



export interface PatientLearningQuery{
  patientId: string;
  cohortId: string;
}
