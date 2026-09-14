import {BaseAuthDto} from "@shared-lib/base/base-dto";
import {DataAnalysisFileDTO} from "@shared-lib/modules/app-execution/dto/model-workflow-file";
import {ModelWorkflowChatWrapperDTO} from "@shared-lib/modules/app-execution/dto/model-workflow-chat";


export interface CreateModelWorkflowDTO {
  name: string;
}

export interface ModelWorkflowDTO extends BaseAuthDto {
  name: string;
  llmSummary?: string | null;
}

export interface ModelWorkflowDetailDTO extends ModelWorkflowDTO {
  messages: ModelWorkflowChatWrapperDTO[];
  files: DataAnalysisFileDTO[];
}

