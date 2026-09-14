import {BaseWorkflowExperimentDTO, BaseWorkflowStepDTO} from "@shared-lib/modules/experiments/dto/experiments";
import {DataAnalysisFileDTO} from "@shared-lib/modules/app-execution/dto/model-workflow-file";
import {RunMessageLogDTO, RunMessageMetricDTO} from "@shared-lib/modules/experiments/dto/log";

export interface DataAnalysisWorkflowRunStepDTO extends BaseWorkflowStepDTO {

  metrics?: RunMessageMetricDTO[];
  logs?: RunMessageLogDTO[];

  hyperParams?: { [key: string]: string };
  inputs?: { [key: string]: string };
  result?: { [key: string]: string };

  inputFiles?: DataAnalysisFileDTO[];
  outputFiles?: DataAnalysisFileDTO[];

  lastLog?: string;
}

export interface DataAnalysisWorkflowRunDTO extends BaseWorkflowExperimentDTO {
  workflowId: number;
  dataAnalysisId: number;
  steps: DataAnalysisWorkflowRunStepDTO[];
}
