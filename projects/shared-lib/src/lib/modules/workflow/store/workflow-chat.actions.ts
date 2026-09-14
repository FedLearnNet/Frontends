import {createActionGroup, emptyProps, props} from "@ngrx/store";
import {WorkflowChatMessageDTO} from "@shared-lib/modules/workflow/dto/workflow-chat";

export const WorkflowChatActions = createActionGroup({
  source: 'WorkflowChat',
  events: {
    'Connect': props<{ workflowId: number }>(),
    'Disconnect': emptyProps(),

    'Socket Opened': emptyProps(),
    'Socket Closed': emptyProps(),
    'Socket Error': props<{ error: any }>(),
    'Add Message': props<{ msg: WorkflowChatMessageDTO }>(),
    'Send User Message': props<{ content: string }>(),
  }
});
