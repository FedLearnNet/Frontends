import {BasePipelineDTO} from "@shared-lib/modules/pipeline/dto/pipeline";

export {PipelineStatus, StepName} from "@shared-lib/modules/pipeline/dto/pipeline";
export type {PipelineStepDTO} from "@shared-lib/modules/pipeline/dto/pipeline";

export enum PipelineType {
  MODEL = "MODEL",
  APP = "APP",
}

export enum PipelineRunMode {
  // builds and publishes, needs the publish settings
  ALL = "ALL",
  BUILD_ONLY = "BUILD_ONLY",
  LOCAL_BUILD = "LOCAL_BUILD",
  SCAN_ONLY = "SCAN_ONLY",
}

export const pipelineRunModeLabels: Record<PipelineRunMode, string> = {
  [PipelineRunMode.ALL]: 'Build and publish',
  [PipelineRunMode.BUILD_ONLY]: 'Build',
  [PipelineRunMode.LOCAL_BUILD]: 'Local build',
  [PipelineRunMode.SCAN_ONLY]: 'Vulnerability rescan',
};

export interface PipelineDTO extends BasePipelineDTO {
  pipelineType: PipelineType;
  runMode: PipelineRunMode;
  secret?: string;
  modelSubId?: number;
  appVersionId?: number;
}

export interface PipelineCreateDTO {
  pipelineType: PipelineType;
  runMode?: PipelineRunMode;
  modelSubId?: number;
  appVersionId?: number;

  autoStart?: boolean;
}
