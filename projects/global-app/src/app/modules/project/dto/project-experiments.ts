import {TestRunDTO} from "../../tool-development/dto/test-run";
import {ExecutionMode} from "@shared-lib/modules/app-execution/dto/execution-run";


// Where a training of the project runs: on the platform, across clinics, or on one chosen clinic (TRE).
export type ProjectRunKind = 'local' | 'federated' | 'tre';

// A training of the project or a test of its workflow: a run whose experiment names the project.
export type ProjectRunDTO = TestRunDTO;

export interface ProjectFederatedCreateExperimentDTO {
  name: string;
  description: string;
  modelNeedToBePublic: boolean;
  platformIsCoordinator: boolean;
  // TRE: the query response of the chosen client
  queryResponseId?: number;
}

export interface CreateProjectLocalExperimentDTO {
  name: string;
  description: string;
}

export function kindOf(run: ProjectRunDTO): ProjectRunKind {
  return run.mode === ExecutionMode.FEDERATED ? 'federated' : run.mode === ExecutionMode.TRE ? 'tre' : 'local';
}

export function projectIdOf(run: ProjectRunDTO): number | undefined {
  return run.experiment?.projectId ?? undefined;
}
