import {ResultAnalyzerResultDTO} from "@shared-lib/modules/app-execution/dto/data-analysis-llm";
import {FileDTO} from "@shared-lib/modules/files/dto/file";
import {StoreSelectDialogResult} from "@shared-lib/modules/store/components/model/model-select-dialog";
import {DataAnalysisWorkflowRunDTO} from "@shared-lib/modules/app-execution/dto/data-analysis-workflow";
import {ModelWorkflowDetailDTO} from "@shared-lib/modules/app-execution/dto/model-workflow";

export interface DataAnalysisResultAnalyzerDialogData {
  dataAnalysisId: number;
  fileId: number;
  title: string;
  file: FileDTO;
}

export type ResultAnalysisItemKey = string;

export interface ResultAnalysisItemState {
  key: ResultAnalysisItemKey;
  dataAnalysisId: number;
  fileId: number;

  loading: boolean;
  loaded: boolean;
  error: string | null;

  result: ResultAnalyzerResultDTO | null;

  updatedAt?: Date;
}


export interface SelectedDataAnalysisState {
  id: number;

  detail?: ModelWorkflowDetailDTO | null;
  selectedTool?: StoreSelectDialogResult | null;
  selectedToolHyperParams?: { [key: string]: any } | null;
  activeTool?: StoreSelectDialogResult | null;
  activeToolHyperParams?: { [key: string]: any } | null;
  selectedWorkflowDetail?: DataAnalysisWorkflowRunDTO | null;

  chatConnected?: boolean;
  chatError?: string;
  loading: boolean;
  loaded: boolean;
  error: string | null;
}
