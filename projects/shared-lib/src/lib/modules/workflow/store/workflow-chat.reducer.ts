import {createReducer, on} from '@ngrx/store';
import {WorkflowChatMessageDTO} from "@shared-lib/modules/workflow/dto/workflow-chat";
import {WorkflowChatActions} from "@shared-lib/modules/workflow/store/workflow-chat.actions";

export interface WorkflowChatState {
  connected: boolean;
  workflowId?: number;
  messages: WorkflowChatMessageDTO[]
  error?: any;
}

export const initialState: WorkflowChatState = {
  connected: false,
  messages: []
};
export const featureKey = 'workflowChat';

export const workflowChatReducer = createReducer(
  initialState,
  on(WorkflowChatActions.socketOpened, (s): WorkflowChatState => ({
    ...s,
    connected: true,
    error: undefined,
    messages: []
  })),
  on(WorkflowChatActions.addMessage, (s, {msg}): WorkflowChatState => ({
    ...s,
    messages: !msg.request && s.messages.find(m => m.id === msg.id)
      ? s.messages.map(m => m.id === msg.id ? msg : m)
      : [...s.messages, msg]
  })),
  on(WorkflowChatActions.connect, (s, {workflowId}): WorkflowChatState => ({
    ...s,
    workflowId
  })),
  on(WorkflowChatActions.disconnect, (s): WorkflowChatState => ({
    ...s,
    workflowId: undefined
  })),
  on(WorkflowChatActions.socketClosed, (s): WorkflowChatState => ({
    ...s,
    connected: false,
    messages: []
  })),
  on(WorkflowChatActions.socketError, (s, {error}): WorkflowChatState => ({
    ...s,
    error
  })),
);

