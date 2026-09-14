import {createAction, props} from '@ngrx/store';
import {WorkflowCreateDTO, WorkflowDTO} from "@shared-lib/modules/workflow/dto/workflow.dto";

export const listWorkflows = createAction(
  '[Workflow] List Workflows'
);

export const listWorkflowsSuccess = createAction(
  '[Workflow] List Workflows Success',
  props<{ workflows: WorkflowDTO[] }>()
);

export const listWorkflowsFailure = createAction(
  '[Workflow] List Workflows Failure',
  props<{ error: any }>()
);

export const listWorkflowForApp = createAction(
  '[Workflow] List Workflow For App',
  props<{ appId: number }>()
);

export const listWorkflowForAppSuccess = createAction(
  '[Workflow] List Workflow For App Success',
  props<{ appId: number, workflows: WorkflowDTO[] }>()
);

export const listWorkflowForAppFailure = createAction(
  '[Workflow] List Workflow For App Failure',
  props<{ error: any }>()
);


export const loadWorkflow = createAction(
  '[Workflow] Load Workflow',
  props<{ id: number }>()
);

export const loadWorkflowSuccess = createAction(
  '[Workflow] Load Workflow Success',
  props<{ workflow: WorkflowDTO }>()
);

export const loadWorkflowFailure = createAction(
  '[Workflow] Load Workflow Failure',
  props<{ error: any }>()
);

// === CREATE ===
export const createWorkflow = createAction(
  '[Workflow] Create Workflow',
  props<{ createDTO: WorkflowCreateDTO }>()
);

export const createWorkflowSuccess = createAction(
  '[Workflow] Create Workflow Success',
  props<{ workflow: WorkflowDTO }>()
);

export const createWorkflowFailure = createAction(
  '[Workflow] Create Workflow Failure',
  props<{ error: any }>()
);

export const createNextEmptyWorkflow = createAction(
  '[Workflow] Create Empty Next Workflow'
);

export const createNextEmptyWorkflowSuccess = createAction(
  '[Workflow] Create Empty Next Workflow Success',
  props<{ workflow: WorkflowDTO }>()
);

export const createNextEmptyWorkflowFailure = createAction(
  '[Workflow] Create Empty Next Workflow Failure',
  props<{ error: any }>()
);

// === UPDATE ===
export const updateWorkflow = createAction(
  '[Workflow] Update Workflow',
  props<{ id: number; updateDTO: WorkflowDTO }>()
);

export const updateWorkflowSuccess = createAction(
  '[Workflow] Update Workflow Success',
  props<{ workflow: WorkflowDTO }>()
);

export const updateWorkflowFailure = createAction(
  '[Workflow] Update Workflow Failure',
  props<{ error: any }>()
);

// === CLEAR ===
export const clearSelectedWorkflow = createAction(
  '[Workflow] Clear Selected Workflow'
);

// === DELETE ===
export const deleteWorkflow = createAction(
  '[Workflow] Delete Workflow',
  props<{ id: number }>()
);

export const deleteWorkflowSuccess = createAction(
  '[Workflow] Delete Workflow Success',
  props<{ id: number }>()
);

export const deleteWorkflowFailure = createAction(
  '[Workflow] Delete Workflow Failure',
  props<{ error: any }>()
);
