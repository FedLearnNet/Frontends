import {TestRunDTO} from "../../tool-development/dto/test-run";
import {ExecutionMode} from "@shared-lib/modules/app-execution/dto/execution-run";


// Where a training of the project runs: on the platform, or across clinics.
export type ProjectRunKind = 'local' | 'federated';

// A training of the project or a test of its workflow: a run whose experiment names the project.
export type ProjectRunDTO = TestRunDTO;

export interface ProjectFederatedCreateExperimentDTO {
  name: string;
  description: string;
  modelNeedToBePublic: boolean;
}

export interface CreateProjectLocalExperimentDTO {
  name: string;
  description: string;
}

export function kindOf(run: ProjectRunDTO): ProjectRunKind {
  return run.mode === ExecutionMode.FEDERATED ? 'federated' : 'local';
}

export function projectIdOf(run: ProjectRunDTO): number | undefined {
  return run.experiment?.projectId ?? undefined;
}
