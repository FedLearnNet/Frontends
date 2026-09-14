import {createFeatureSelector, createSelector} from '@ngrx/store';
import {featureKey, WorkflowState} from './workflow.reducer';

export const selectWorkflowState = createFeatureSelector<WorkflowState>(featureKey);


export const selectSelectedWorkflow = createSelector(
  selectWorkflowState,
  (s) => s.selectedWorkflow
);

export const selectWorkflowLoading = createSelector(
  selectWorkflowState,
  (s) => s.loading
);

export const selectWorkflowError = createSelector(
  selectWorkflowState,
  (s) => s.error
);

export const selectWorkflowErrorById = (id: number) =>
  createSelector(selectWorkflowState, (s) => s.errorById[id]);

export const selectWorkflows = createSelector(
  selectWorkflowState,
  (s) => s.workflows
);

export const selectWorkflowsForApp = (appId?: number) =>
  createSelector(selectWorkflowState, (s) => appId ? s.workflowsApp[appId] : []);
