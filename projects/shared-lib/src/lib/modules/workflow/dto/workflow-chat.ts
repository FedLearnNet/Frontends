import {UiActionDto} from "@shared-lib/modules/app-execution/dto/model-workflow-chat";

export interface WorkflowChatMessageDTO {
  message: string;

  request: boolean;
  done: boolean;

  errorMessage: string;
  statusMessage: string;


  createdAt: Date;

  action?: UiActionDto;
  id: string;
}
