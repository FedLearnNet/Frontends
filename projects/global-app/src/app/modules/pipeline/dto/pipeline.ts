import {BasePipelineDTO} from "@shared-lib/modules/pipeline/dto/pipeline";

export {PipelineStatus, StepName} from "@shared-lib/modules/pipeline/dto/pipeline";
export type {PipelineStepDTO} from "@shared-lib/modules/pipeline/dto/pipeline";

export enum PipelineType {
  MODEL = "MODEL",
  APP = "APP",
}

export interface PipelineDTO extends BasePipelineDTO {
  pipelineType: PipelineType;
  secret?: string;
  modelSubId?: number;
  appVersionId?: number;
}

export interface PipelineCreateDTO {
  pipelineType: PipelineType;
  modelSubId?: number;
  appVersionId?: number;

  autoStart?: boolean;
}
