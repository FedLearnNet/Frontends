import {RunStatusTypes} from "../../../../../../global-app/src/app/modules/tool-development/dto/test-run";
import {BaseDto} from "@shared-lib/base/base-dto";
import {ProjectStatus} from "@global-app/project/dto/project";


export interface BaseWorkflowExperimentDTO extends BaseDto {
  finishedAt?: Date | null;
  startedAt?: Date | null;
  experimentStatus?: ProjectStatus | null;
  currentWorkflowNodeId?: number | null;
  steps: BaseWorkflowStepDTO[];
}

export interface BaseWorkflowStepDTO extends BaseDto {
  stepStatus?: RunStatusTypes | null;
  lastError?: string | null;
  progress?: number | null;
  containerId?: string | null;
  workflowNodeId?: number | null;
  experimentId?: number | null;
}
