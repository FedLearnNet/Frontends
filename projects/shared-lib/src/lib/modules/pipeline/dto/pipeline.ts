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

export const STEP_ORDER: StepName[] = [
  StepName.FETCH_CONFIG,
  StepName.CLONE_REPO,
  StepName.FETCH_FILES,
  StepName.BUILD_IMAGE,
  StepName.SCAN_IMAGE,
  StepName.MALWARE_CHECK,
  StepName.RUN_PYTEST,
  StepName.PUSH_IMAGE,
  StepName.COLLECT_SUMMARY,
];

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

export interface BasePipelineDTO extends BaseDto {
  pipelineStatus: PipelineStatus;
  pipelineSteps?: PipelineStepDTO[];
  publishInfo?: AppPublishInfoDTO;
}

export function stepLabel(step: PipelineStepDTO): string {
  return step.name.toLowerCase().split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}
