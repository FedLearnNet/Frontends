import {DataAnalysisFileDTO} from "@shared-lib/modules/app-execution/dto/model-workflow-file";

export interface ModelWorkflowUploadFileResponse {
  result?: DataAnalysisFileDTO;
  inProgress: boolean;
  progress: number;
}


export interface ModelWorkflowFileURL {
  id: number;
  secret: string;
  name: string;
}
