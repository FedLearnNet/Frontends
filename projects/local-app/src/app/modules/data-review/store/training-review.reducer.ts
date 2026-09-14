import {createReducer, on} from '@ngrx/store';
import {TrainingReviewActions} from './training-review.actions';
import {FederatedLearningRequestDto} from "@local-app/data-review/dto/federated-learning-request";

export interface TrainingReviewState {
  items: FederatedLearningRequestDto[];
  page: number;
  pageSize: number;
  total: number;

  loading: boolean;
  error: any;
  errorById: { [id: number]: any };
}

export const initialTrainingReviewState: TrainingReviewState = {
  items: [],
  page: 1,
  pageSize: 10,
  total: 0,

  loading: false,
  error: null,
  errorById: {},
};

export const featureKey = 'trainingReview';

export const trainingReviewReducer = createReducer(
  initialTrainingReviewState,

  on(TrainingReviewActions.loadPage, (state, {page, pageSize}): TrainingReviewState => ({
    ...state,
    loading: true,
    error: null,
    page: page ?? state.page,
    pageSize: pageSize ?? state.pageSize
  })),

  on(TrainingReviewActions.loadPageSuccess, (state, {items, page, pageSize, total}): TrainingReviewState => ({
    ...state,
    items,
    page,
    pageSize,
    total,
    loading: false,
    error: null,
  })),

  on(TrainingReviewActions.loadPageFailure, (state, {error}): TrainingReviewState => ({
    ...state,
    loading: false,
    error,
  })),
  on(TrainingReviewActions.updateStatus, (state): TrainingReviewState => ({
    ...state,
    loading: true,
    error: null,
  })),

  on(TrainingReviewActions.updateStatusSuccess, (state, {id}): TrainingReviewState => ({
    ...state,
    items: state.items.filter(i => i.id !== id),
    loading: false,
    error: null,
    errorById: {...state.errorById, [id]: null},
  })),

  on(TrainingReviewActions.updateStatusFailure, (state, {id, error}): TrainingReviewState => ({
    ...state,
    loading: false,
    error,
    errorById: {...state.errorById, [id]: error},
  })),

  // Housekeeping
  on(TrainingReviewActions.resetErrors, (state): TrainingReviewState => ({
    ...state,
    error: null,
    errorById: {},
  })),
);
