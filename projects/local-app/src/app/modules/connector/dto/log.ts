import {BaseDto} from "@shared-lib/base/base-dto";

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
