import {createFeatureSelector, createSelector} from '@ngrx/store';
import {featureKey, FederatedLearningProjectState} from './federated-learning-project.reducer';

export const selectFeature = createFeatureSelector<FederatedLearningProjectState>(featureKey);

export const selectItems = createSelector(selectFeature, s => s.items);
export const selectTotal = createSelector(selectFeature, s => s.total);

export const selectLoading = createSelector(selectFeature, s => s.loading);
export const selectError = createSelector(selectFeature, s => s.error);

export const selectSelectedDetail = createSelector(selectFeature, s => s.selectedDetail);
export const selectRunDetail = createSelector(selectFeature, s => s.runDetail);

export const selectConnectedDetail = createSelector(selectFeature, s => s.connectedDetail);
