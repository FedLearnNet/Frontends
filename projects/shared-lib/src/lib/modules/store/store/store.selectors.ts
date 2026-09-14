import {createFeatureSelector, createSelector} from '@ngrx/store';
import {featureKey, StoreState} from './store.reducer';

export const selectStoreState = createFeatureSelector<StoreState>(featureKey);

export const selectStoreList = createSelector(selectStoreState, s => s.list);
export const selectStoreGraph = createSelector(selectStoreState, s => s.graph);
export const selectStoreGraphPaths = createSelector(selectStoreState, s => s.graphsPath);

export const selectSelectedModel = createSelector(selectStoreState, s => s.selectedModel);
export const selectSelectedApp = createSelector(selectStoreState, s => s.selectedApp);
export const selectAppByVersionId = (id: number) =>
  createSelector(selectStoreState, s => s.appByVersionId[id] ?? null);
export const selectStoreLoading = createSelector(selectStoreState, s => s.loading);
export const selectStoreError = createSelector(selectStoreState, s => s.error);

export const selectTotalItems = createSelector(selectStoreState, s => s.totalItems);
export const selectListRequestParams = createSelector(selectStoreState, s => s.listRequestParams);
export const selectPaginationData = createSelector(
  selectListRequestParams,
  selectTotalItems,
  (params, total) => ({
    page: params.page,
    size: params.size,
    totalItems: total,
  })
);


export const selectAppRatings = (appId: number) =>
  createSelector(selectStoreState, s => s.appRatings[appId] ?? []);

export const selectModelVersionRatings = (modelVersionId: number) =>
  createSelector(selectStoreState, s => s.modelVersionRatings[modelVersionId] ?? []);
