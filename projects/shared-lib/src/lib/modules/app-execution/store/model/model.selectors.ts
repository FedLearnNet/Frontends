import {createFeatureSelector, createSelector} from '@ngrx/store';
import {featureKey, ModelState} from './model.reducer';

export const selectModelState = createFeatureSelector<ModelState>(featureKey);

export const selectAllModels = createSelector(
  selectModelState,
  state => state.models ? state.models : [],
);

export const selectMyModels = createSelector(
  selectModelState,
  state => state.myModels
);

export const selectModelDetail = createSelector(
  selectModelState,
  state => state.detail
);

export const selectSubModelForRun = createSelector(
  selectModelState,
  state => state.subModelForRun
);

export const selectSubModelForExperiment = createSelector(
  selectModelState,
  state => state.modelVersionForExperiment
);

export const selectSelectedSubModel = createSelector(
  selectModelState,
  state => state.selectedSubModel
);

export const selectModelLoading = createSelector(
  selectModelState,
  state => state.loading
);

export const selectModelError = createSelector(
  selectModelState,
  state => state.error
);
