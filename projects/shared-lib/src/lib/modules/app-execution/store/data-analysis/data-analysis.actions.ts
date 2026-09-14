import {createActionGroup, emptyProps, props} from '@ngrx/store';
import {ResultAnalyzerResultDTO} from "@shared-lib/modules/app-execution/dto/data-analysis-llm";
import {
  CreateModelWorkflowDTO,
  ModelWorkflowDetailDTO,
  ModelWorkflowDTO
} from "@shared-lib/modules/app-execution/dto/model-workflow";
import {DataAnalysisWorkflowRunDTO} from "@shared-lib/modules/app-execution/dto/data-analysis-workflow";
import {
  DataAnalysisCreatePredictionDTO,
  DataAnalysisPredictionDTO,
  DataAnalysisRunModesEnum
} from "@shared-lib/modules/app-execution/dto/prediction";
import {ModelWorkflowChatWrapperDTO} from "@shared-lib/modules/app-execution/dto/model-workflow-chat";
import {StoreSelectDialogResult} from "@shared-lib/modules/store/components/model/model-select-dialog";
import {DataAnalysisFileDTO} from "@shared-lib/modules/app-execution/dto/model-workflow-file";
import {ModelWorkflowUploadFileResponse} from "@shared-lib/modules/app-execution/model/model-workflow-file";

export const DataAnalysisActions = createActionGroup({
  source: 'DataAnalysis',
  events: {
    'Error': props<{ error: string }>(),

    //Data Analysis CRUD
    'Load Data Analyses': emptyProps(),
    'Load Data Analyses Success': props<{ workflows: ModelWorkflowDTO[] }>(),
    'Load Data Analyses Failure': props<{ error: string }>(),

    'Load Data Analysis': props<{ id: number }>(),
    'Load Data Analysis Success': props<{ id: number; dataAnalysis: ModelWorkflowDetailDTO }>(),
    'Load Data Analysis Failure': props<{ id: number; error: string }>(),

    'Load Data Analysis Workflow Run': props<{ id: number; experimentId: number }>(),
    'Load Data Analysis Workflow Run Success': props<{ id: number; workflow: DataAnalysisWorkflowRunDTO }>(),
    'Load Data Analysis Workflow Run Failure': props<{ id: number; error: string }>(),

    'Delete Data Analysis': props<{ id: number }>(),
    'Delete Data Analysis Success': props<{ id: number }>(),
    'Delete Data Analysis Failure': props<{ error: string }>(),

    'Create Data Analysis': props<{ workflow: CreateModelWorkflowDTO }>(),
    'Create Data Analysis Success': props<{ workflow: ModelWorkflowDTO }>(),
    'Create Data Analysis Failure': props<{ error: any }>(),

    //Data analysis other
    'Generate and download Report': props<{ id: number }>(),
    'Download Result': props<{ containerId: string, mode: DataAnalysisRunModesEnum }>(),
    'Download whole Workflow': props<{ experimentId: number }>(),
    'Select Store Element': props<{ storeElement: StoreSelectDialogResult, hyperParams?: { [key: string]: any }; }>(),
    'Set Active Store Element': props<{ storeElement: StoreSelectDialogResult, hyperParams?: { [key: string]: any }; }>(),
    'Unselect Store Element': emptyProps(),
    'Add Experiment Results': props<{ prediction: DataAnalysisPredictionDTO }>(),
    'Add Data Analysis Message': props<{ wrapper: ModelWorkflowChatWrapperDTO }>(),

    //Analyze result file
    'AnalyzeResult': props<{ dataAnalysisId: number, fileId: number }>(),
    'AnalyzeResult Chunk': props<{ dataAnalysisId: number, fileId: number, result: ResultAnalyzerResultDTO }>(),
    'AnalyzeResult Success': props<{ dataAnalysisId: number, fileId: number }>(),
    'AnalyzeResult Failure': props<{ dataAnalysisId: number, fileId: number, error: string }>(),


    //CHAT
    'Chat Connect': props<{ dataAnalysisId: number }>(),
    'Chat Disconnect': emptyProps(),

    'Chat Socket Opened': emptyProps(),
    'Chat Socket Closed': emptyProps(),
    'Chat Socket Error': props<{ error: any }>(),
    'Chat Incoming Wrapper': props<{ wrapper: ModelWorkflowChatWrapperDTO }>(),
    'Chat Send User Message': props<{ content: string }>(),

    //FILES
    'Load Files': props<{ dataAnalysisId: number }>(),
    'Load Files Success': props<{ files: DataAnalysisFileDTO[] }>(),
    'Load Files Failure': props<{ error: any }>(),

    'Upload File': props<{ dataAnalysisId: number; file: File }>(),
    'Link File': props<{ dataAnalysisId: number; fileId: number }>(),
    'Upload File Progress': props<{ dataAnalysisId: number; response: ModelWorkflowUploadFileResponse }>(),
    'Upload File Success': props<{ dataAnalysisId: number; response: ModelWorkflowUploadFileResponse }>(),
    'Upload File Failure': props<{ error: any }>(),

    'Upload File With FileId': props<{ dataAnalysisId: number; file: File; fileId: number }>(),
    'Upload File Progress With FileId': props<{
      dataAnalysisId: number;
      response: ModelWorkflowUploadFileResponse;
      fileId: number
    }>(),
    'Upload File Success With FileId': props<{
      dataAnalysisId: number;
      response: ModelWorkflowUploadFileResponse;
      fileId: number
    }>(),
    'Upload File Failure With FileId': props<{ error: any; fileId: number }>(),

    'Delete File': props<{ dataAnalysisId: number; fileId: number }>(),
    'Delete File Success': props<{ dataAnalysisId: number; fileId: number }>(),
    'Delete File Failure': props<{ error: any }>(),

    //Running
    'Start Workflow Run': props<{ workflowId: number; data: DataAnalysisCreatePredictionDTO }>(),
    'Start Run': props<{ data: DataAnalysisCreatePredictionDTO }>(),

    //Stopping
    'Stop Workflow Run': props<{ dataAnalysisId: number, workflowId: number; id: number }>(),
    'Stop Run': props<{ dataAnalysisId: number, id: number }>(),

    //delete Run
    'Delete Workflow Run': props<{ dataAnalysisId: number, workflowId: number; id: number }>(),
    'Delete Workflow Run Success': props<{ dataAnalysisId: number, workflowId: number; id: number }>(),
    'Delete Workflow Run Failure': props<{ dataAnalysisId: number, workflowId: number; id: number, error: any }>(),
    'Delete Run': props<{ dataAnalysisId: number, id: number }>(),
    'Delete Run Success': props<{ dataAnalysisId: number, id: number }>(),
    'Delete Run Failure': props<{ dataAnalysisId: number, id: number, error: any }>(),

    'Run Progress': props<{ prediction: DataAnalysisPredictionDTO }>(),
    'Run Error': props<{ error: any }>(),
    'Run Complete': emptyProps(),


    'Start Run Updates': props<{ prediction: DataAnalysisPredictionDTO }>(),
    'Start Workflow Run Updates': props<{ prediction: DataAnalysisPredictionDTO }>(),
  }
});
