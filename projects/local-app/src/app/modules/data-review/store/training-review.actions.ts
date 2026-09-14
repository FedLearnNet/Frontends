import {createActionGroup, emptyProps, props} from '@ngrx/store';
import {
  FederatedLearningRequestDto,
  FederatedLearningRequestStatus,
  PatientLearningDto
} from "@local-app/data-review/dto/federated-learning-request";

export const TrainingReviewActions = createActionGroup({
  source: 'Training Review',
  events: {
    'Load Page': props<{ page?: number; pageSize?: number; status?: FederatedLearningRequestStatus }>(),
    'Load Page Success': props<{
      items: FederatedLearningRequestDto[];
      page: number;
      pageSize: number;
      total: number;
      status?: FederatedLearningRequestStatus
    }>(),
    'Load Page Failure': props<{ error: any }>(),

    'Update Status': props<{
      id: number;
      status: FederatedLearningRequestStatus;
      requestPatients?: PatientLearningDto[];
      modelCanBePublic?: boolean
    }>(),
    'Update Status Success': props<{ id: number; updated: FederatedLearningRequestDto }>(),
    'Update Status Failure': props<{ id: number; error: any }>(),

    'Reset Errors': emptyProps(),
  },
});
