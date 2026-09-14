import {createActionGroup, emptyProps, props} from '@ngrx/store';
import {FederatedLearningProjectDto} from "../dto/federated-learning-project";
import {RunMessageLogDTO} from "@shared-lib/modules/experiments/dto/log";
import {FederatedLearningExperimentStepDetailDTO} from "../dto/federated-learming-steps";

export const FederatedLearningProjectActions = createActionGroup({
  source: 'Federated Learning Project',
  events: {
    'Load List': props<{ page?: number; pageSize?: number }>(),
    'Load List Success': props<{
      items: FederatedLearningProjectDto[];
      page: number;
      pageSize: number;
      total: number
    }>(),
    'Load List Failure': props<{ error: any }>(),

    'Load Detail': props<{ id: number }>(),
    'Load Detail Success': props<{ detail: FederatedLearningProjectDto }>(),
    'Load Detail Failure': props<{ id: number; error: any }>(),

    'Export Patients': props<{ id: number }>(),
    'Export Patients Success': emptyProps(),
    'Export Patients Failure': props<{ error: any }>(),

    'Open Live List': props<{ page?: number; pageSize?: number }>(),
    'Close Live List': emptyProps(),

    'Open Live Detail': props<{ id: number }>(),
    'Close Live Detail': props<{ id: number }>(),

    'Select Local Step': props<{ nodeId: number }>(),

    'Load Step Detail': props<{ experimentId: number; stepId: number }>(),
    'Load Step Detail Success': props<{
      experimentId: number;
      stepId: number;
      detail: FederatedLearningExperimentStepDetailDTO
    }>(),
    'Load Step Detail Error': props<{ experimentId: number; stepId: number; error: any }>(),

    'Load Step Messages': props<{ experimentId: number; stepId: number }>(),
    'Load Step Messages Success': props<{
      experimentId: number;
      stepId: number;
      message: RunMessageLogDTO
    }>(),
    'Load Step Messages Error': props<{ experimentId: number; stepId: number; error: any }>(),

    'Live Connected': props<{ channel: 'list' | 'detail'; id?: number }>(),
    'Live Event': props<{ payload: FederatedLearningProjectDto }>(),
    'Live Error': props<{ channel: 'list' | 'detail'; id?: number; error: any }>(),
    'Live Disconnected': props<{ channel: 'list' | 'detail'; id?: number }>(),

    'Reset Errors': emptyProps(),
  },
});
