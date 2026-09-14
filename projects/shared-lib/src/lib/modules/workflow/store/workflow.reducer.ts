import {createReducer, on} from '@ngrx/store';
import * as WorkflowActions from './workflow.actions';
import {WorkflowDTO} from "@shared-lib/modules/workflow/dto/workflow.dto";

export interface WorkflowState {
  workflows: WorkflowDTO[];
  selectedWorkflow: WorkflowDTO | null;
  workflowsApp: { [appId: number]: WorkflowDTO[] };

  loading: boolean;
  error: any;
  errorById: { [id: number]: any };
}

export const initialWorkflowState: WorkflowState = {
  workflows: [],
  selectedWorkflow: null,
  workflowsApp: {},
  loading: false,
  error: null,
  errorById: {},
};

export const featureKey = 'workflow';

export const workflowReducer = createReducer(
  initialWorkflowState,
  // === CLEAR ===
  on(WorkflowActions.clearSelectedWorkflow, (state): WorkflowState => ({
    ...state,
    selectedWorkflow: null,
    loading: false,
    error: null,
  })),

  // === LOAD SINGLE ===
  on(WorkflowActions.loadWorkflow, (state): WorkflowState => ({
    ...state,
    selectedWorkflow: null,
    loading: true,
    error: null,
  })),

  on(WorkflowActions.loadWorkflowSuccess, (state, {workflow}): WorkflowState => ({
    ...state,
    selectedWorkflow: workflow,
    loading: false,
    error: null,
    errorById: {...state.errorById, [workflow.id!]: null},
  })),

  on(WorkflowActions.loadWorkflowFailure, (state, {error}): WorkflowState => ({
    ...state,
    loading: false,
    error,
  })),

  // === LIST ALL ===
  on(WorkflowActions.listWorkflows, (state): WorkflowState => ({
    ...state,
    loading: true,
    error: null,
  })),

  on(WorkflowActions.listWorkflowsSuccess, (state, { workflows }): WorkflowState => ({
    ...state,
    loading: false,
    workflows,
  })),

  on(WorkflowActions.listWorkflowsFailure, (state, { error }): WorkflowState => ({
    ...state,
    loading: false,
    error,
  })),

  // === LIST BY APP ===
  on(WorkflowActions.listWorkflowForApp, (state): WorkflowState => ({
    ...state,
    loading: true,
    error: null,
  })),

  on(WorkflowActions.listWorkflowForAppSuccess, (state, { appId, workflows }): WorkflowState => ({
    ...state,
    loading: false,
    workflowsApp: {
      ...state.workflowsApp,
      [appId]: workflows,
    },
  }) as any),

  on(WorkflowActions.listWorkflowForAppFailure, (state, { error }): WorkflowState => ({
    ...state,
    loading: false,
    error,
  })),

  // === CREATE ===
  on(WorkflowActions.createWorkflow, (state): WorkflowState => ({
    ...state,
    loading: true,
    error: null,
  })),

  on(WorkflowActions.createWorkflowSuccess, (state, {workflow}): WorkflowState => ({
    ...state,
    workflows: [...state.workflows, workflow],
    selectedWorkflow: workflow,
    loading: false,
    error: null,
  })),
  on(WorkflowActions.createWorkflowFailure, (state, {error}): WorkflowState => ({
    ...state,
    loading: false,
    error,
  })),
  on(WorkflowActions.createNextEmptyWorkflow, (state): WorkflowState => ({
    ...state,
    loading: true,
    error: null,
  })),

  on(WorkflowActions.createNextEmptyWorkflowSuccess, (state, {workflow}): WorkflowState => ({
    ...state,
    workflows: [...state.workflows, workflow],
    selectedWorkflow: workflow,
    loading: false,
    error: null,
  })),
  on(WorkflowActions.createNextEmptyWorkflowFailure, (state, {error}): WorkflowState => ({
    ...state,
    loading: false,
    error,
  })),
  // === UPDATE ===
  on(WorkflowActions.updateWorkflow, (state): WorkflowState => ({
    ...state,
    loading: true,
    error: null,
  })),

  on(WorkflowActions.updateWorkflowSuccess, (state, {workflow}): WorkflowState => ({
    ...state,
    workflows: state.workflows.map((w) =>
      w.id === workflow.id ? workflow : w
    ),
    workflowsApp: Object.fromEntries(
      Object.entries(state.workflowsApp).map(([appId, list]) => [
        appId,
        list.map((w) => w.id === workflow.id ? workflow : w)
      ])
    ),
    selectedWorkflow:
      state.selectedWorkflow?.id === workflow.id ? workflow : state.selectedWorkflow,
    loading: false,
    error: null,
  })),

  on(WorkflowActions.updateWorkflowFailure, (state, {error}): WorkflowState => ({
    ...state,
    loading: false,
    error,
  })),

  // === DELETE ===
  on(WorkflowActions.deleteWorkflow, (state): WorkflowState => ({
    ...state,
    loading: true,
    error: null,
  })),

  on(WorkflowActions.deleteWorkflowSuccess, (state, {id}): WorkflowState => ({
    ...state,
    workflows: state.workflows.filter((w) => w.id !== id),
    workflowsApp: Object.fromEntries(
      Object.entries(state.workflowsApp).map(([appId, list]) => [
        appId,
        list.filter((w) => w.id !== id),
      ])
    ),
    selectedWorkflow:
      state.selectedWorkflow?.id === id ? null : state.selectedWorkflow,
    loading: false,
    error: null,
  })),

  on(WorkflowActions.deleteWorkflowFailure, (state, {error}): WorkflowState => ({
    ...state,
    loading: false,
    error,
  }))
);
