import {createActionGroup, emptyProps, props} from '@ngrx/store';
import {
  CreateProjectLocalExperimentDTO,
  ProjectLocalExperimentDTO,
  ProjectLocalExperimentStepDetailDTO
} from "@global-app/project/dto/project-experiments";
import {RunMessageLogDTO} from "@shared-lib/modules/experiments/dto/log";

export const ProjectLocalExperimentsActions = createActionGroup({
  source: 'ProjectLocalExperiments',
  events: {
    'Load List': props<{ projectId: number }>(),
    'Load List Success': props<{ projectId: number; items: ProjectLocalExperimentDTO[] }>(),
    'Load List Error': props<{ projectId: number; error: any }>(),

    'Load Experiment': props<{ projectId: number; id: number }>(),
    'Load Experiment Success': props<{ experiment: ProjectLocalExperimentDTO }>(),
    'Load Experiment Error': props<{ projectId: number; id: number; error: any }>(),

    'Load Experiment Test': props<{ projectId: number }>(),
    'Load Experiment Test Success': props<{ experiment: ProjectLocalExperimentDTO }>(),
    'Load Experiment Test Error': props<{ error: any }>(),

    'Create': props<{ projectId: number; dto: CreateProjectLocalExperimentDTO }>(),
    'Create Success': props<{ projectId: number; item: ProjectLocalExperimentDTO }>(),
    'Create Error': props<{ projectId: number; error: any }>(),

    'Start Local Experiment': props<{ projectId: number; experimentId: number }>(),
    'Start Local Experiment Success': props<{ projectId: number; experiment: ProjectLocalExperimentDTO }>(),
    'Start Local Experiment Failure': props<{ projectId: number; experimentId: number; error: any }>(),

    'Stop Local Experiment': props<{ projectId: number; experimentId: number }>(),
    'Stop Local Experiment Success': props<{ projectId: number; experiment: ProjectLocalExperimentDTO }>(),
    'Stop Local Experiment Failure': props<{ projectId: number; experimentId: number; error: any }>(),

    'Create Test': props<{ projectId: number; }>(),
    'Create Test Success': props<{ projectId: number; item: ProjectLocalExperimentDTO }>(),
    'Create Test Error': props<{ projectId: number; error: any }>(),

    'Select Local Step': props<{ nodeId: number }>(),

    'Load Local Step Detail': props<{ projectId: number; experimentId: number; stepId: number }>(),
    'Load Local Step Detail Success': props<{
      projectId: number;
      experimentId: number;
      stepId: number;
      detail: ProjectLocalExperimentStepDetailDTO
    }>(),
    'Load Local Step Detail Error': props<{ projectId: number; experimentId: number; stepId: number; error: any }>(),

    'Load Local Step Messages': props<{ projectId: number; experimentId: number; stepId: number }>(),
    'Load Local Step Messages Success': props<{
      projectId: number;
      experimentId: number;
      stepId: number;
      message: RunMessageLogDTO
    }>(),
    'Load Local Step Messages Error': props<{ projectId: number; experimentId: number; stepId: number; error: any }>(),

    'Live Connected': props<{ projectId: number; channel: 'experiment' | 'test'; experimentId?: number }>(),
    'Live Error': props<{ projectId: number; channel: 'experiment' | 'test'; experimentId?: number; error: any }>(),
    'Live Disconnected': props<{ projectId: number; channel: 'experiment' | 'test'; experimentId?: number }>(),

    'Reset Errors': emptyProps(),
  }
});
