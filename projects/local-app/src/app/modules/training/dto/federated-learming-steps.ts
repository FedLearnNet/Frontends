import {BaseDto} from "@shared-lib/base/base-dto";
import {ProjectStatus} from "@global-app/project/dto/project"; //TODO change to core
import {RunMessageLogDTO, RunMessageMetricDTO} from "@shared-lib/modules/experiments/dto/log";
import {FileDTO} from "@shared-lib/modules/files/dto/file";

export interface FederatedLearningExperimentStepDTO extends BaseDto {
  stepStatus: ProjectStatus;
  lastError: string;
  progress: number;
  step: number;
  appId: number;
  experimentId: number;
  globalRequestId: number;
  oldFCVersion: boolean;
}


export interface FederatedLearningExperimentStepDetailDTO extends FederatedLearningExperimentStepDTO {
  logs: RunMessageLogDTO[];
  metrics: RunMessageMetricDTO[];
  result?: { [key: string]: any };
  inputFiles?: FileDTO[];
  outputFiles?: FileDTO[];
}
