import {RunMessageLogDTO, RunMessageMetricDTO} from "@shared-lib/modules/experiments/dto/log";
import {RunStatusTypes} from "../../../../../../global-app/src/app/modules/tool-development/dto/test-run";
import {FileDTO} from "@shared-lib/modules/files/dto/file";

export interface ExperimentData {
  logs?: RunMessageLogDTO[];
  metric?: RunMessageMetricDTO[];
  experimentId: number;
  stepId: number;
  hyperParams?: { [key: string]: string };
  status?: RunStatusTypes;
  error?: string;

  inputData?: ExperimentStepData;
  outputData?: ExperimentStepData;
}

export interface ExperimentStepData {
  data: { [key: string]: string };
  files: FileDTO[];
}
