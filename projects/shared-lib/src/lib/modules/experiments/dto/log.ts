import {BaseDto} from "@shared-lib/base/base-dto";

export enum RunMessageTypes {
  METRIC = "metric",
  LOG = "log",
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
