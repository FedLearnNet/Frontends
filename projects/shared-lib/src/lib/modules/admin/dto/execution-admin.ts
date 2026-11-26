import {BaseDto} from "@shared-lib/base/base-dto";
import {RunStatusTypes} from "../../../../../../global-app/src/app/modules/tool-development/dto/test-run";
import {
  BaseDetailResultDTO,
  ExecutionFailureDTO,
  ExecutionFileDTO,
  ExecutionLocation,
  ExecutionMode,
  ExecutionParticipantDTO,
  ExecutionPurpose,
  ExecutionRunDTO,
  ExecutionRunStepDTO,
} from "@shared-lib/modules/app-execution/dto/execution-run";

export interface ExecutionRunSummaryDTO extends BaseDto {
  publicId: string;
  name?: string | null;
  purpose: ExecutionPurpose;
  mode: ExecutionMode;
  location: ExecutionLocation;
  status: RunStatusTypes;
  keycloakId?: string | null;
  startedAt?: Date | null;
  finishedAt?: Date | null;
  failure?: ExecutionFailureDTO | null;
  stepCount: number;
  attemptCount: number;
}

export interface ExecutionRunFilter {
  status?: RunStatusTypes | null;
  purpose?: ExecutionPurpose | null;
  mode?: ExecutionMode | null;
  location?: ExecutionLocation | null;
}

// What a clinic or the platform adds to an attempt; fields of the other side stay unset.
export interface AdminExecutionAttemptDTO extends BaseDetailResultDTO<ExecutionFileDTO> {
  result?: string | null;
  rounds?: unknown[];
  participantId?: string | null;
  currentRound?: number | null;
  messagesSent?: number | null;
  messagesReceived?: number | null;
  waitingFor?: string[] | null;
}

export interface AdminExecutionStepDTO extends ExecutionRunStepDTO<AdminExecutionAttemptDTO> {
  appName?: string | null;
  appImage?: string | null;
  globalAppVersionId?: number | null;
  globalModelVersionId?: number | null;
  transformerId?: number | null;
}

export interface AdminExecutionRunDTO extends ExecutionRunDTO<AdminExecutionAttemptDTO> {
  steps: AdminExecutionStepDTO[];
  keycloakId?: string | null;
  // Clinic
  cohortId?: number | null;
  toolType?: string | null;
  connectorRunId?: number | null;
  participantId?: string | null;
  // Platform
  experimentId?: number | null;
  federatedAppId?: number | null;
  federatedAppVersionId?: number | null;
  federatedAppVersionName?: string | null;
  testEngineId?: number | null;
  testEngineMode?: string | null;
  engineMode?: string | null;
  participants?: ExecutionParticipantDTO[];
}
