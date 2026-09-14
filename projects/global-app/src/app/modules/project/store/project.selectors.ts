import {createFeatureSelector, createSelector} from '@ngrx/store';
import {featureKey, ProjectState} from './project.reducer';

export const selectFeature = createFeatureSelector<ProjectState>(featureKey);

export const selectProjects = createSelector(
  selectFeature,
  s => s.projects
);

export const selectLoading = createSelector(
  selectFeature,
  s => s.loading
);


export const selectCurrentUpload = createSelector(
  selectFeature,
  s => s.currentUpload
);

export const selectError = createSelector(
  selectFeature,
  s => s.error
);

export const selectErrorById = createSelector(
  selectFeature,
  s => s.errorById
);

export const selectProjectById = (id: number) =>
  createSelector(selectProjects, list => list.find(p => p.id === id) ?? null);

export const selectSelectedProject = createSelector(
  selectFeature,
  s => s.selectedProject
);
