import {createFeatureSelector, createSelector} from '@ngrx/store';
import {featureKey as modelWorkflowFeatureKey, WorkflowChatState} from './workflow-chat.reducer';

export const selectModelWorkflowChatState = createFeatureSelector<WorkflowChatState>(modelWorkflowFeatureKey);

export const selectConnected = createSelector(selectModelWorkflowChatState, s => s.connected);
export const selectChatError = createSelector(selectModelWorkflowChatState, s => s.error);
export const selectChatMessages = createSelector(selectModelWorkflowChatState, s => s.messages);
