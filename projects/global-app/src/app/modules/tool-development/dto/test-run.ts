import {TestEngineMode} from "./test-engine";
import {BaseDto} from "@shared-lib/base/base-dto";
import {
  BaseDetailResultDTO,
  displayedAttempt,
  ExecutionFederationDTO,
  ExecutionFileDTO,
  ExecutionParticipantDTO,
  ExecutionRunDTO,
  ExecutionRunStepDTO
} from "@shared-lib/modules/app-execution/dto/execution-run";
import {RunMessageRoundDTO} from "@shared-lib/modules/experiments/dto/log";
import {ExperimentDiagramConfigDTO} from "./config";
import {ProjectStatus} from "@global-app/project/dto/project";


export enum RunStatusTypes {
  PENDING = "PENDING",
  INITIALIZED = "INITIALIZED",
  STARTED = "STARTED",
  RUNNING = "RUNNING",
  STOPPED = "STOPPED",
  FINISHED = "FINISHED",
  ERROR = "ERROR"
}


// An attempt of a test run; in a federated test run one per participant. Logs, metrics and round messages
// are only filled in the run detail.
export interface TestAttemptDTO extends BaseDetailResultDTO<ExecutionFileDTO> {
  rounds: RunMessageRoundDTO[];
  // For a federated test run: the participant whose share it is, and how far it got.
  participantId?: string | null;
  currentRound?: number | null;
  messagesSent?: number | null;
  messagesReceived?: number | null;
  waitingFor?: string[] | null;
}

// What a developer sets up to try an app: name, description and charts over the trials, per tool.
export interface ExecutionExperimentDTO extends BaseDto {
  name: string;
  description?: string | null;
  diagramConfigs: ExperimentDiagramConfigDTO[];
  keycloakId?: string | null;
  test: boolean;
  federatedAppId?: number | null;
  federatedAppVersionId?: number | null;
  federatedAppVersionName?: string | null;
  projectId?: number | null;
  // For a training across clinics: how the clinics know it, and how many accepted it before it starts.
  globalUniqueId?: string | null;
  status?: ProjectStatus | null;
  workflowId?: number | null;
  acceptanceCount?: number | null;
  acceptanceClinicCount?: number | null;
  relayServerAddress?: string | null;
  modelCanBePublic?: boolean | null;
  modelNeedToBePublic?: boolean | null;
}

// A test run in the developer's app engine: a run of one step, federated or not. The run of an experiment
// searches a grid of hyper parameters, a trial per attempt.
export interface TestRunDTO extends ExecutionRunDTO<TestAttemptDTO> {
  keycloakId?: string | null;
  experimentId?: number | null;
  experiment?: ExecutionExperimentDTO | null;
  participants?: ExecutionParticipantDTO[];
  federatedAppId: number;
  federatedAppVersionId: number;
  federatedAppVersionName: string;
  // The test engine container that served the run; none for the developer's local engine
  testEngineId?: number | null;
  testEngineMode?: TestEngineMode | null;
  // What the container of a TEST_HOSTING run is for
  engineMode?: TestEngineMode | null;
}

export type TestRunStepDTO = ExecutionRunStepDTO<TestAttemptDTO>;


export interface TestRunCreateDTO {
  federatedAppVersionId: number;
  hyperParams: { [key: string]: string };
  inputFilePaths?: { [key: string]: string };
  // Input values, e.g. download links of file store files for a test engine container
  inputs?: { [key: string]: unknown };
  projectId?: number;
}


export function testStepOf(run: TestRunDTO): TestRunStepDTO | undefined {
  return run.steps?.[0];
}

/** The attempt the test run stands for: the selected one, for a federated test run its aggregator, else the latest. */
export function testAttemptOf(run: TestRunDTO): TestAttemptDTO | undefined {
  const step = testStepOf(run);
  return step ? displayedAttempt(step) : undefined;
}

/** The attempts of a test run in trial order: the trials of an experiment, the participants of a federated one. */
export function attemptsOf(run: TestRunDTO): TestAttemptDTO[] {
  return [...(testStepOf(run)?.attempts ?? [])].sort((a, b) => a.trialIndex - b.trialIndex);
}

export const participantsOf = attemptsOf;
export const trialsOf = attemptsOf;

export function federationOf(run: TestRunDTO): ExecutionFederationDTO | undefined {
  return testStepOf(run)?.federation ?? undefined;
}

export function trialNameOf(attempt: TestAttemptDTO): string {
  return `Trial ${attempt.trialIndex + 1}`;
}

/** A color per trial of an experiment, the same on every page; golden angle steps keep neighbours apart. */
export function trialColorOf(attempt: TestAttemptDTO): string {
  const hue = (attempt.trialIndex * 137.508) % 360;
  const lightness = 0.5;
  const chroma = (1 - Math.abs(2 * lightness - 1)) * 0.65;
  const x = chroma * (1 - Math.abs((hue / 60) % 2 - 1));
  const [r, g, b] = hue < 60 ? [chroma, x, 0] : hue < 120 ? [x, chroma, 0] : hue < 180 ? [0, chroma, x]
    : hue < 240 ? [0, x, chroma] : hue < 300 ? [x, 0, chroma] : [chroma, 0, x];
  const m = lightness - chroma / 2;
  return '#' + [r, g, b].map(v => Math.round((v + m) * 255).toString(16).padStart(2, '0')).join('');
}

/** Who an attempt of a federated test run stands for. */
export function participantOf(run: TestRunDTO, attempt: TestAttemptDTO): ExecutionParticipantDTO | undefined {
  return run.participants?.find(participant => participant.participantId === attempt.participantId);
}
