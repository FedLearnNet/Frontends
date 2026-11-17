import {createActionGroup, emptyProps, props} from '@ngrx/store';
import {
  CreateProjectLocalExperimentDTO,
  ProjectFederatedCreateExperimentDTO,
  ProjectRunDTO,
  ProjectRunKind
} from "@global-app/project/dto/project-experiments";

// Trainings of a project on the platform or across clinics, and the test of its workflow, all runs.
export const ProjectRunsActions = createActionGroup({
  source: 'ProjectRuns',
  events: {
    'Load List': props<{ projectId: number; kind: ProjectRunKind }>(),
    'Load List Success': props<{ projectId: number; kind: ProjectRunKind; runs: ProjectRunDTO[] }>(),

    'Create': props<{ projectId: number; kind: ProjectRunKind; dto: CreateProjectLocalExperimentDTO | ProjectFederatedCreateExperimentDTO }>(),
    'Start': props<{ projectId: number; kind: ProjectRunKind; runId: number }>(),
    'Stop': props<{ projectId: number; kind: ProjectRunKind; runId: number }>(),

    'Follow': props<{ projectId: number; kind: ProjectRunKind; runId: number }>(),
    'Follow Ended': props<{ runId: number }>(),
    'Run Changed': props<{ run: ProjectRunDTO }>(),

    'Create Test': props<{ projectId: number }>(),
    'Follow Test': props<{ projectId: number }>(),
    'Follow Test Ended': emptyProps(),
    'Test Changed': props<{ run: ProjectRunDTO }>(),

    // The followed training with the logs and metrics of its steps.
    'Load Detail': props<{ projectId: number; runId: number }>(),
    'Load Detail Success': props<{ run: ProjectRunDTO }>(),

    'Failure': props<{ error: any }>(),
  }
});
