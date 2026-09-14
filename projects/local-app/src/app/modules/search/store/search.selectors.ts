import {createFeatureSelector, createSelector} from '@ngrx/store';
import {featureKey, SearchState} from './search.reducer';

export const selectFeature = createFeatureSelector<SearchState>(featureKey);

export const selectQuery = createSelector(selectFeature, s => s.query);
export const selectLoading = createSelector(selectFeature, s => s.loading);
export const selectError = createSelector(selectFeature, s => s.error);

export const selectResults = createSelector(selectFeature, s =>
  [...s.results].sort((a, b) => b.score - a.score)
);

export const selectResultCount = createSelector(selectResults, r => r.length);

export const selectHasQuery = createSelector(selectQuery, q => q.trim().length > 0);
