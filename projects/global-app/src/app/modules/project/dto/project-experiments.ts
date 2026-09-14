import {BaseDto} from "@shared-lib/base/base-dto";
import {ProjectDetailDto, ProjectStatus} from "@global-app/project/dto/project";
import {ExperimentDiagramConfigDTO} from "../../tool-development/dto/config";
import {RunStatusTypes} from "../../tool-development/dto/test-run";
import {BaseWorkflowExperimentDTO, BaseWorkflowStepDTO} from "@shared-lib/modules/experiments/dto/experiments";
import {RunMessageLogDTO, RunMessageMetricDTO} from "@shared-lib/modules/experiments/dto/log";
import {FileDTO} from "@shared-lib/modules/files/dto/file";
import {WorkflowDTO} from "@shared-lib/modules/workflow/dto/workflow.dto";


export interface ProjectFederatedCreateExperimentDTO {
  name: string;
  description: string;

  modelNeedToBePublic: boolean;
}

export interface ProjectFederatedExperimentStepDTO extends BaseWorkflowStepDTO {
  name: string;
  color: string;
  projectOrderValue: number;
  status: RunStatusTypes;
  appVersionId: number;
  experimentId: number;
}

export interface ProjectFederatedExperimentStepDetailDTO extends ProjectFederatedExperimentStepDTO {
  logMessages: RunMessageLogDTO[];
  metrics?: RunMessageMetricDTO[];
  result?: { [key: string]: any };
  inputFiles?: FileDTO[];
  outputFiles?: FileDTO[];
}


export interface ProjectFederatedExperimentParticipantDTO extends BaseDto {
  uniqueRandomClinicId: string;
  projectStatus: RunStatusTypes;
  currentStep: number;
  stepStatus: ProjectStatus;
  experimentId: number;
}


export interface ProjectFederatedExperimentDTO extends BaseWorkflowExperimentDTO {
  name: string;
  description: string;
  acceptanceCount: number;

  //model access
  modelCanBePublic: boolean;
  modelNeedToBePublic: boolean;

  workflow: WorkflowDTO;
  projectVersion: ProjectDetailDto;
  diagramConfigs: ExperimentDiagramConfigDTO[];
  relayServerAddress: string;
  projectId: number;
}

export interface ProjectFederatedExperimentDetailDTO extends ProjectFederatedExperimentDTO {
  steps: ProjectFederatedExperimentStepDTO[];
  participants: ProjectFederatedExperimentParticipantDTO[];
}

export interface CreateProjectLocalExperimentDTO {
  name: string;
  description: string;
}

export interface ProjectLocalExperimentDTO extends BaseWorkflowExperimentDTO {
  name: string;
  description: string;
  testRun: boolean;
  projectVersion: ProjectDetailDto;
  diagramConfigs: ExperimentDiagramConfigDTO[];
  steps: ProjectLocalExperimentStepDTO[];
  projectId: number;
  workflowId: number;
  workflowVersion: number;
  groupId: string;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface ProjectLocalExperimentStepDTO extends BaseWorkflowStepDTO {
  // Standard impl for now
}

export interface ProjectLocalExperimentStepDetailDTO extends ProjectLocalExperimentStepDTO {
  logMessages: RunMessageLogDTO[];
  metrics?: RunMessageMetricDTO[];
  result?: { [key: string]: any };
  inputFiles?: FileDTO[];
  outputFiles?: FileDTO[];
}
