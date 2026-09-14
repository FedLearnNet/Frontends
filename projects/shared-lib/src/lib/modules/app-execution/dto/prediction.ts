import {BaseAuthDto} from "@shared-lib/base/base-dto";
import {RunStatusTypes} from "../../../../../../global-app/src/app/modules/tool-development/dto/test-run";
import {DataAnalysisFileDTO} from "@shared-lib/modules/app-execution/dto/model-workflow-file";
import {RunMeta} from "@shared-lib/modules/app-execution/dto/run-meta";

export enum DataAnalysisRunModesEnum {
  PREDICTION = "PREDICTION",
  WORKFLOW = "WORKFLOW"
}

export interface DataAnalysisStopPredictionDTO {
  workflowId?: number;
}

export interface DataAnalysisCreatePredictionDTO {
  inputs: { [key: string]: any };
  hyperParams: { [key: string]: any };
  modelSubId?: number | null | undefined;
  modelVersionId?: number;
  appVersionId?: number;
  workflowId?: number;
}

export interface DataAnalysisPredictionDTO extends BaseAuthDto {
  inputs: { [key: string]: any };
  hyperParams: { [key: string]: any };

  modelSubId: number;
  status: RunStatusTypes;
  lastLog?: string
  lastError?: string
  rawLog?: string

  result?: any;
  containerId?: string;
  modelId?: number;
  name?: string;
  dataAnalysisId: number;
  appVersionId?: number;
  //if executing tool is a workflow
  workflowId?: number;
  currentWorkflowStep?: number;
  maxWorkflowSteps?: number;

  inputFiles: DataAnalysisFileDTO[];
  outputFiles: DataAnalysisFileDTO[];

  // Run metadata (timings today). meta.timings.RUNTIME present when measured; OVERHEAD_* only when
  // the backend flag posymed.runtime.overhead.enabled is on.
  meta?: RunMeta | null;
}

export interface DataAnalysisResultDTO extends DataAnalysisPredictionDTO {
  runMode: DataAnalysisRunModesEnum;

  //for workflows
  maxWorkflowSteps?: number;
  currentWorkflowStep?: number;
  currentWorkflowStepId?: number;
  workflowRunId?: number;
}
