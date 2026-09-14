import {createFeatureSelector, createSelector} from '@ngrx/store';
import {featureKey, TrainingReviewState} from './training-review.reducer';
import {FederatedLearningRequestStatus} from "@local-app/data-review/dto/federated-learning-request";

export const selectFeature = createFeatureSelector<TrainingReviewState>(featureKey);

export const selectItems = createSelector(selectFeature, s => s.items);
export const selectLoading = createSelector(selectFeature, s => s.loading);
export const selectError = createSelector(selectFeature, s => s.error);

export const selectById = (id: number) =>
  createSelector(selectItems, list => list.find(i => i.id === id) ?? null);

export const selectFilteredByStatus = (status?: FederatedLearningRequestStatus) =>
  createSelector(selectItems, items =>
    status ? items.filter(i => (i.status ?? '').toUpperCase() === status.toUpperCase()) : items
  );
