import {BaseDto} from "@shared-lib/base/base-dto";
import {AppPublishInfoDTO} from "@shared-lib/modules/store/dto/publish-info";

export enum PipelineStatus {
  PENDING = "PENDING",
  RUNNING = "RUNNING",
  SUCCESS = "SUCCESS",
  WARNING = "WARNING",
  STOPPED = "STOPPED",
  FAILED = "FAILED",
}

export enum PipelineType {
  MODEL = "MODEL",
  APP = "APP",
}

export enum StepName {
  PREFLIGHT = "PREFLIGHT",
  CLONE_REPO = "CLONE_REPO",
  BUILD_IMAGE = "BUILD_IMAGE",
  FETCH_CONFIG = "FETCH_CONFIG",
  FETCH_FILES = "FETCH_FILES",
  PUSH_IMAGE = "PUSH_IMAGE",
  SCAN_IMAGE = "SCAN_IMAGE",
  MALWARE_CHECK = "MALWARE_CHECK",
  RUN_PYTEST = "RUN_PYTEST",
  COLLECT_SUMMARY = "COLLECT_SUMMARY",
}

export interface PipelineStepDTO extends BaseDto {
  name: StepName;
  stepStatus: PipelineStatus;
  logs?: string;
  startedAt?: Date;
  finishedAt?: Date;
  errorCode?: string;
  errorMessage?: string;
  pipelineId?: number;
}


export interface PipelineDTO extends BaseDto {
  pipelineStatus: PipelineStatus;
  pipelineType: PipelineType;
  pipelineSteps?: PipelineStepDTO[];
  publishInfo?: AppPublishInfoDTO;
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
