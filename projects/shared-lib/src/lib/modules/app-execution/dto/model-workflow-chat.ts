import {DataAnalysisRunDTO} from "@shared-lib/modules/app-execution/dto/execution-run";
import {BaseChatMessageDTO} from "@shared-lib/modules/app-execution/dto/chat";

export enum ModelWorkflowChatMessageType {
  CHAT_MESSAGE = "CHAT_MESSAGE",
  RUN = "RUN",
}


export interface ModelWorkflowChatWrapperDTO {
  type: ModelWorkflowChatMessageType;
  message: ModelWorkflowMessageDto | DataAnalysisRunDTO;
}

export interface ModelWorkflowMessageDto extends BaseChatMessageDTO {

  action?: UiActionDto;
  workflowId: number;
}

export enum UiActionType {
  ADD_TO_WORKFLOW = "ADD_TO_WORKFLOW",
  DETAIL = "DETAIL"
}

export enum UiActionKind {
  FILE = "FILE",
  MODEL = "MODEL",
  APP = "APP",
}

export interface UiActionDto {
  action: UiActionType;
  kind?: UiActionKind;
  params: Map<string, object>;
  autorun: boolean;
  label: string;
  relatedId: number;
}
