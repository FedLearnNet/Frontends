import {createActionGroup, emptyProps, props} from '@ngrx/store';
import {
  ProjectFederatedCreateExperimentDTO,
  ProjectFederatedExperimentDetailDTO,
  ProjectFederatedExperimentDTO,
  ProjectFederatedExperimentStepDetailDTO
} from "@global-app/project/dto/project-experiments";
import {RunMessageLogDTO} from "@shared-lib/modules/experiments/dto/log";

export const ProjectFederatedExperimentsActions = createActionGroup({
  source: 'ProjectFederatedExperiments',
  events: {
    'Load List': props<{ projectId: number }>(),
    'Load List Success': props<{ projectId: number; items: ProjectFederatedExperimentDTO[] }>(),
    'Load List Error': props<{ projectId: number; error: any }>(),

    'Load Experiment': props<{ projectId: number; id: number }>(),
    'Load Experiment Success': props<{ experiment: ProjectFederatedExperimentDetailDTO }>(),
    'Load Experiment Error': props<{ projectId: number; id: number; error: any }>(),

    'Create': props<{ projectId: number; dto: ProjectFederatedCreateExperimentDTO }>(),
    'Create Success': props<{ projectId: number; item: ProjectFederatedExperimentDetailDTO }>(),
    'Create Error': props<{ projectId: number; error: any }>(),

    'Start Experiment': props<{ projectId: number; experimentId: number }>(),
    'Start Experiment Success': props<{ projectId: number; experiment: ProjectFederatedExperimentDetailDTO }>(),
    'Start Experiment Failure': props<{ projectId: number; experimentId: number; error: any }>(),

    'Stop Experiment': props<{ projectId: number; experimentId: number }>(),
    'Stop Experiment Success': props<{ projectId: number; experiment: ProjectFederatedExperimentDetailDTO }>(),
    'Stop Experiment Failure': props<{ projectId: number; experimentId: number; error: any }>(),


    'Select Step': props<{ nodeId: number }>(),

    'Load Step Detail': props<{ projectId: number; experimentId: number; stepId: number }>(),
    'Load Step Detail Success': props<{
      projectId: number;
      experimentId: number;
      stepId: number;
      detail: ProjectFederatedExperimentStepDetailDTO
    }>(),
    'Load Step Detail Error': props<{ projectId: number; experimentId: number; stepId: number; error: any }>(),

    'Load Step Messages': props<{ projectId: number; experimentId: number; stepId: number }>(),
    'Load Step Messages Success': props<{
      projectId: number;
      experimentId: number;
      stepId: number;
      message: RunMessageLogDTO
    }>(),
    'Load Step Messages Error': props<{ projectId: number; experimentId: number; stepId: number; error: any }>(),

    'Live Connected': props<{ projectId: number; experimentId: number }>(),
    'Live Error': props<{ projectId: number; experimentId: number; error: any }>(),
    'Live Disconnected': props<{ projectId: number; experimentId: number }>(),

    'Reset Errors': emptyProps(),
  }
});
