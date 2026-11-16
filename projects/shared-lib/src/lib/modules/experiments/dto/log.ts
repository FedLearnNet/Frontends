import {BaseDto} from "@shared-lib/base/base-dto";

export enum RunMessageTypes {
  METRIC = "metric",
  LOG = "log",
  ROUND = "round",
}

export interface RunMessageDTO extends BaseDto {
  process: string;
  message: string;
  type: RunMessageTypes;
  runId: number;
}

export interface RunMessageLogDTO extends RunMessageDTO {

  severity: string;
  message: string;
  caller: string;
  stackTrace: string;
  group: string;

}

export interface RunMessageMetricDTO extends RunMessageDTO {

  metric: string;
  value: string;
  x: string;
  xUnit: string;

}

// A message a participant sent or received in a round of a federated run; its runId is the participant's attempt.
export interface RunMessageRoundDTO extends RunMessageDTO {
  direction: 'SEND' | 'RECEIVE' | string;
  round?: number | null;
  fromParticipant?: string | null;
  toParticipant?: string | null;
  communicationId?: string | null;
  payloadPreview?: string | null;
  workerId?: string | null;
}
