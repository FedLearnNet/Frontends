import {BaseDto} from "@shared-lib/base/base-dto";
import {RunStatusTypes} from "../../../../../../global-app/src/app/modules/tool-development/dto/test-run";
import {RunMeta} from "@shared-lib/modules/app-execution/dto/run-meta";
import {RunMessageLogDTO, RunMessageMetricDTO} from "@shared-lib/modules/experiments/dto/log";
import {DataAnalysisFileDTO} from "@shared-lib/modules/app-execution/dto/model-workflow-file";
import {FileDTO} from "@shared-lib/modules/files/dto/file";

// Mirrors the shared execution model of the backend: run -> steps -> attempts.

export enum ExecutionPurpose {
  ANALYSIS = "ANALYSIS",
  TRAINING = "TRAINING",
  PROCESSING = "PROCESSING",
  TEST = "TEST",
}

export enum ExecutionMode {
  SINGLE = "SINGLE",
  FEDERATED = "FEDERATED",
}

export enum ExecutionLocation {
  LOCAL = "LOCAL",
  PLATFORM = "PLATFORM",
}

export enum FailureCategory {
  VALIDATION = "VALIDATION",
  AUTHORIZATION = "AUTHORIZATION",
  INFRASTRUCTURE = "INFRASTRUCTURE",
  TOOL = "TOOL",
  CANCELLED = "CANCELLED",
  UNKNOWN = "UNKNOWN",
}

export enum SearchStrategyType {
  GRID = "GRID",
  RANDOM = "RANDOM",
}

export enum ParamDomainType {
  FIXED = "FIXED",
  CHOICE = "CHOICE",
  INT_RANGE = "INT_RANGE",
  UNIFORM = "UNIFORM",
  LOG_UNIFORM = "LOG_UNIFORM",
}

export enum OptimizationDirection {
  MAXIMIZE = "MAXIMIZE",
  MINIMIZE = "MINIMIZE",
}

export interface ExecutionFailureDTO {
  type?: string | null;
  category?: FailureCategory | null;
  message?: string | null;
}

// FIXED reads value, CHOICE values, the ranges low and high.
export interface ParamDomainDTO {
  type: ParamDomainType;
  value?: unknown;
  values?: unknown[];
  low?: number;
  high?: number;
}

export enum FederatedParticipantType {
  CLIENT = "CLIENT",
  AGGREGATOR = "AGGREGATOR",
}

// How a federated step runs, without the relay keys; its attempts are the participants' share of it.
export interface ExecutionFederationDTO {
  totalRounds?: number | null;
  currentRound?: number | null;
  startAggregator?: boolean | null;
  pollInterval?: number | null;
  timeout?: number | null;
  maxPolls?: number | null;
  relayStopped?: boolean | null;
}

// Who takes part in a federated run, a clinic or a participant the developer's app engine simulates.
export interface ExecutionParticipantDTO extends BaseDto {
  runId: number;
  participantId: string;
  role?: FederatedParticipantType | null;
  coordinator: boolean;
  modelCanBePublic?: boolean | null;
  inputFilePaths?: { [key: string]: string } | null;
  // What a clinic reports: how its run goes, which workflow node it is at and how far that step got.
  status?: RunStatusTypes | null;
  currentNodeId?: string | null;
  stepStatus?: string | null;
}

export interface HyperParamSearchDTO {
  strategy: SearchStrategyType;
  space: { [name: string]: ParamDomainDTO };
  iterations: number;
  metric?: string | null;
  direction: OptimizationDirection;
}

export interface BaseExecutionAttemptDTO extends BaseDto {
  publicId: string;
  stepId: number;
  stepPublicId?: string | null;
  runId: number;
  runPublicId?: string | null;
  trialIndex: number;
  params?: { [key: string]: unknown } | null;
  scoreMetric?: RunMessageMetricDTO | null;
  status: RunStatusTypes;
  containerId?: string | null;
  progress?: number | null;
  startedAt?: Date | null;
  finishedAt?: Date | null;
  failure?: ExecutionFailureDTO | null;
  meta?: RunMeta | null;
}

// An attempt with the raw result its app uploaded.
export interface ExecutionAttemptDTO extends BaseExecutionAttemptDTO {
  result?: string | null;
}

// An attempt with what its app read, reported and wrote. Logs and metrics are only filled in the detail.
export interface BaseDetailResultDTO<F extends BaseDto> extends BaseExecutionAttemptDTO {
  outputData: { [key: string]: unknown };
  lastLog?: string | null;
  logs: RunMessageLogDTO[];
  metrics: RunMessageMetricDTO[];
  inputFiles: F[];
  outputFiles: F[];
}

// A file an attempt read or wrote, by the name its app knows it.
export interface ExecutionFileDTO extends BaseDto {
  attemptId: number;
  name: string;
  direction: 'INPUT' | 'OUTPUT';
  file: FileDTO;
}

export interface ExecutionRunStepDTO<A extends BaseExecutionAttemptDTO = ExecutionAttemptDTO> extends BaseDto {
  publicId: string;
  runId: number;
  runPublicId?: string | null;
  workflowNodeId?: number | null;
  federatedAppVersionId?: number | null;
  modelSubId?: number | null;
  modelId?: number | null;
  name?: string | null;
  status: RunStatusTypes;
  startedAt?: Date | null;
  finishedAt?: Date | null;
  failure?: ExecutionFailureDTO | null;
  search?: HyperParamSearchDTO | null;
  inputs?: { [key: string]: unknown } | null;
  inputFilePaths?: { [key: string]: string } | null;
  federation?: ExecutionFederationDTO | null;
  selectedAttemptId?: number | null;
  attempts: A[];
}

export interface ExecutionRunDTO<A extends BaseExecutionAttemptDTO = ExecutionAttemptDTO> extends BaseDto {
  publicId: string;
  name?: string | null;
  purpose: ExecutionPurpose;
  mode: ExecutionMode;
  location: ExecutionLocation;
  status: RunStatusTypes;
  startedAt?: Date | null;
  finishedAt?: Date | null;
  failure?: ExecutionFailureDTO | null;
  steps: ExecutionRunStepDTO<A>[];
}

// A run with what its apps reported, read and wrote; on a clinic also what it belongs to.
export interface ExecutionRunDetailDTO extends ExecutionRunDTO<BaseDetailResultDTO<ExecutionFileDTO>> {
  keycloakId?: string | null;
  cohortId?: number | null;
  toolType?: string | null;
  connectorRunId?: number | null;
  participantId?: string | null;
}

export type DataAnalysisAttemptDTO = BaseDetailResultDTO<DataAnalysisFileDTO>;

// Steps come in execution order.
export interface DataAnalysisRunDTO extends ExecutionRunDTO<DataAnalysisAttemptDTO> {
  keycloakId: string;
  dataAnalysisId?: number | null;
  workflowId?: number | null;
}

export type DataAnalysisRunStepDTO = ExecutionRunStepDTO<DataAnalysisAttemptDTO>;

export function isFinalStatus(status?: RunStatusTypes | null): boolean {
  return status === RunStatusTypes.FINISHED || status === RunStatusTypes.STOPPED || status === RunStatusTypes.ERROR;
}

/** The step the run is at: the first one not done, else the last one. */
export function currentStep<A extends BaseExecutionAttemptDTO>(run: ExecutionRunDTO<A>): ExecutionRunStepDTO<A> | undefined {
  return run.steps.find(step => !isFinalStatus(step.status)) ?? run.steps[run.steps.length - 1];
}

export function hasFinishedStep(run: ExecutionRunDTO<BaseExecutionAttemptDTO>): boolean {
  return run.steps.some(step => isFinalStatus(step.status));
}

/** Error of the run, else of its current step or that step's attempt. */
export function errorOf<A extends BaseExecutionAttemptDTO>(run: ExecutionRunDTO<A>): string | undefined {
  const step = currentStep(run);
  return run.failure?.message ?? step?.failure?.message ?? (step && displayedAttempt(step)?.failure?.message) ?? undefined;
}

/** The attempt a step stands for: the selected one, else the latest. */
export function displayedAttempt<A extends BaseExecutionAttemptDTO>(step: ExecutionRunStepDTO<A>): A | undefined {
  const attempts = step.attempts ?? [];
  return attempts.find(attempt => attempt.id === step.selectedAttemptId)
    ?? attempts.reduce<A | undefined>((latest, attempt) =>
      !latest || attempt.trialIndex > latest.trialIndex ? attempt : latest, undefined);
}

/** The attempt of a run of a single app, once there is one. */
export function singleAttemptOf<A extends BaseExecutionAttemptDTO>(run: ExecutionRunDTO<A>): A | undefined {
  const step = run.steps?.[0];
  return step ? displayedAttempt(step) : undefined;
}

/** What the app of a run of a single app logged last. */
export function lastLogOf(run: ExecutionRunDetailDTO): string | null {
  return singleAttemptOf(run)?.lastLog ?? null;
}

/** What the app of a run of a single app wrote. */
export function outputsOf(run: ExecutionRunDetailDTO): ExecutionFileDTO[] {
  return singleAttemptOf(run)?.outputFiles ?? [];
}
