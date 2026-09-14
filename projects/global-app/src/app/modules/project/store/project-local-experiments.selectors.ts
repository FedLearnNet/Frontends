import {createFeatureSelector, createSelector} from '@ngrx/store';
import {featureKey, ProjectLocalExperimentState} from './project-local-experiments.reducer';

export const selectFeature =
  createFeatureSelector<ProjectLocalExperimentState>(featureKey);

export const selectExperiments = createSelector(
  selectFeature,
  (s) => s.experiments
);

export const selectSelectedExperiment = createSelector(
  selectFeature,
  (s) => s.selectedExperiment
);

export const selectLoading = createSelector(
  selectFeature,
  (s) => s.loading
);

export const selectError = createSelector(
  selectFeature,
  (s) => s.error
);

export const selectErrorById = createSelector(
  selectFeature,
  (s) => s.errorById
);

export const selectConnectedById = (id: number) =>
  createSelector(selectFeature, (s) => s.connectedById[id] ?? false);

export const selectCurrentLogs = createSelector(
  selectFeature,
  (s) => s.currentStepLogs
);

export const selectCurrentStepDetail = createSelector(
  selectFeature,
  (s) => s.currentStepDetail
);

export const selectExperimentById = (id: number) =>
  createSelector(selectExperiments, (list) =>
    list.find((e) => e.id === id) ?? null
  );

export const selectErrorFor = (id: number) =>
  createSelector(selectErrorById, (map) => map[id]);

export const selectExperimentsByProject = (projectId: number) =>
  createSelector(selectExperiments, (list) =>
    list.filter((e) => e.projectId === projectId)
  );


export const selectTestExperiment = createSelector(
  selectFeature,
  (s) => s.selectedExperiment
);

export const selectConnectedTestExperiment = createSelector(
  selectFeature,
  (s) => s.connectedTestExperiment
);


