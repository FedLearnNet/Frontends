import {BaseDto} from "@shared-lib/base/base-dto";
import {RunStatusTypes} from "../../../../../../global-app/src/app/modules/tool-development/dto/test-run";

export interface RunMessageLogDTO extends BaseDto {
  process?: string;
  type?: string;
  message: string;
  runId?: number;
  severity?: string;
  caller?: string;
  stackTrace?: string;
  group?: string;
}

export interface ConnectorRunStepDTO extends BaseDto {
  logs?: RunMessageLogDTO[];
  lastLog?: string;
  lastError?: string;
  status?: RunStatusTypes;
  progress?: number;
  containerId?: string;
  connectorRunId?: number;
  transformationId?: number;
}

export interface LogListResponseDTO {
  steps: ConnectorRunStepDTO[];
}

export interface ConnectorRunPatientLogDTO extends BaseDto {
  patientId?: string;
  field?: string;
  message: string;
  level: string;
  logType?: string;
  runId?: number;
}

export interface RunErrorLogListResponseDTO {
  logs: ConnectorRunPatientLogDTO[];
}

export interface ConnectorRunLogRowDTO extends BaseDto {
  message: string;
  level: string;
  runId?: number;
}
