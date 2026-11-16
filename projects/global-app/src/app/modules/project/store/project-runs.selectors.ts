import {createFeatureSelector, createSelector} from '@ngrx/store';
import {featureKey, ProjectRunsState} from './project-runs.reducer';
import {kindOf, ProjectRunKind, projectIdOf} from "@global-app/project/dto/project-experiments";

export const selectFeature = createFeatureSelector<ProjectRunsState>(featureKey);

export const selectRunsOf = (projectId: number, kind: ProjectRunKind) => createSelector(selectFeature,
  (state) => state.runs.filter(run => projectIdOf(run) === projectId && kindOf(run) === kind));

export const selectSelectedRun = createSelector(selectFeature, (state) => state.selectedRun);

export const selectSelectedRunDetail = createSelector(selectFeature, (state) => state.selectedRunDetail);

export const selectTestRun = createSelector(selectFeature, (state) => state.testRun);

export const selectTestConnected = createSelector(selectFeature, (state) => state.testConnected);

export const selectConnectedById = (id: number) => createSelector(selectFeature, (state) => state.connectedById[id] ?? false);

export const selectLoading = createSelector(selectFeature, (state) => state.loading);

export const selectError = createSelector(selectFeature, (state) => state.error);
