import { createFeatureSelector, createSelector } from '@ngrx/store';
import { FederatedLearningProjectState, featureKey } from './federated-learning-project.reducer';

export const selectFeature = createFeatureSelector<FederatedLearningProjectState>(featureKey);

export const selectItems = createSelector(selectFeature, s => s.items);
export const selectPage = createSelector(selectFeature, s => s.page);
export const selectPageSize = createSelector(selectFeature, s => s.pageSize);
export const selectTotal = createSelector(selectFeature, s => s.total);

export const selectLoading = createSelector(selectFeature, s => s.loading);
export const selectError = createSelector(selectFeature, s => s.error);
export const selectErrorById = createSelector(selectFeature, s => s.errorById);

export const selectSelectedDetail = createSelector(selectFeature, s => s.selectedDetail);

export const selectConnectedListLive = createSelector(selectFeature, s => s.connectedListLive);
export const selectConnectedDetail = createSelector(selectFeature, s => s.connectedDetail);

export const selectById = (id: number) =>
  createSelector(selectItems, list => list.find(i => i.experiment.id === id) ?? null);

export const selectHasPrev = createSelector(selectPage, p => p > 1);
export const selectHasNext = createSelector(selectPage, selectPageSize, selectTotal,
  (p, ps, total) => p * ps < total
);

export const selectCurrentLogs = createSelector(
  selectFeature,
  (s) => s.currentStepLogs
);

export const selectCurrentStepDetail = createSelector(
  selectFeature,
  (s) => s.currentStepDetail
);
