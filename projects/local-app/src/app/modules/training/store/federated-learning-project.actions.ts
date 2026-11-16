import {createActionGroup, emptyProps, props} from '@ngrx/store';
import {FederatedLearningProjectDto} from "../dto/federated-learning-project";
import {ExecutionRunDetailDTO} from "@shared-lib/modules/app-execution/dto/execution-run";

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

    // This clinic's run of the selected training, live and with the logs and metrics of its steps.
    'Follow Run': props<{ id: number }>(),
    'Follow Run Ended': emptyProps(),
    'Run Changed': props<{ id: number; run: ExecutionRunDetailDTO }>(),
    'Load Run Detail': props<{ id: number }>(),
    'Load Run Detail Success': props<{ run: ExecutionRunDetailDTO }>(),
    'Load Run Detail Failure': props<{ error: any }>(),

    'Reset Errors': emptyProps(),
  },
});
