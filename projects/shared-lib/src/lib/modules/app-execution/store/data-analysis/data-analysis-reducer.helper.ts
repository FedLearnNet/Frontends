import {
  dataAnalysisKeyOf,
  DataAnalysisState
} from "@shared-lib/modules/app-execution/store/data-analysis/data-analysis.reducer";
import {
  ResultAnalysisItemState,
  SelectedDataAnalysisState
} from "@shared-lib/modules/app-execution/model/data-analyzer";
import {ModelWorkflowDetailDTO} from "@shared-lib/modules/app-execution/dto/model-workflow";
import {
  ModelWorkflowChatMessageType,
  ModelWorkflowChatWrapperDTO
} from "@shared-lib/modules/app-execution/dto/model-workflow-chat";
import {DataAnalysisPredictionDTO} from "@shared-lib/modules/app-execution/dto/prediction";

type ResultPatch = Partial<Omit<ResultAnalysisItemState, 'key' | 'dataAnalysisId' | 'fileId'>> & {
  appendText?: string;
};

type DataAnalysisPatch = Partial<Omit<ModelWorkflowDetailDTO, 'id'>>;

export function upsertResultAnalysisEntity(
  state: DataAnalysisState,
  dataAnalysisId: number,
  fileId: number,
  patch: ResultPatch
): DataAnalysisState {
  const key = dataAnalysisKeyOf(dataAnalysisId, fileId);
  const current = state.resultAnalysis[key];

  const base: ResultAnalysisItemState = current ?? {
    key, dataAnalysisId, fileId,
    loading: false, loaded: false, error: null, result: null, updatedAt: undefined,
  };

  const nextText = patch.appendText ?
    base.result?.result + patch.appendText :
    base.result?.result;

  const next: ResultAnalysisItemState = {
    ...base,
    ...patch,
    result: {
      ...base.result,
      result: nextText ?? "",
    },
    key,
    dataAnalysisId,
    fileId,
    updatedAt: new Date(),
  };

  return {
    ...state,
    resultAnalysis: {...state.resultAnalysis, [key]: next},
  };
}

export function getInitialDataAnalysisState(id: number): SelectedDataAnalysisState {
  return {
    id,
    detail: null,
    selectedTool: null,
    activeTool: null,
    activeToolHyperParams: null,
    selectedWorkflowDetail: null,
    loading: true,
    loaded: false,
    chatConnected: false,
    error: null
  };
}


export function upsertDataAnalysisEntity(
  state: DataAnalysisState,
  dataAnalysisId: number,
  patch: DataAnalysisPatch
): DataAnalysisState {
  const currentSelected = state.selectedAnalysis;

  const baseSelected: SelectedDataAnalysisState =
    currentSelected?.id === dataAnalysisId
      ? currentSelected
      : getInitialDataAnalysisState(dataAnalysisId);

  const baseDetail: ModelWorkflowDetailDTO =
    baseSelected.detail ?? ({ id: dataAnalysisId } as ModelWorkflowDetailDTO);

  const nextDetail: ModelWorkflowDetailDTO = {
    ...baseDetail,
    ...patch,
    id: dataAnalysisId, // enforce id
  };

  return {
    ...state,
    selectedAnalysis: {
      ...baseSelected,
      id: dataAnalysisId,
      detail: nextDetail,
    },
  };
}

export function upsertSelectedAnalysisMessage(
  state: DataAnalysisState,
  dataAnalysisId: number,
  wrapper: ModelWorkflowChatWrapperDTO
): DataAnalysisState {
  const selected = state.selectedAnalysis;
  if (!selected || selected.id !== dataAnalysisId) return state;

  const detail = selected.detail;
  if (!detail) return state;

  const msgs = detail.messages ?? [];
  const idx = msgs.findIndex((message) => areSameMessage(message, wrapper));
  const nextMessages =
    idx >= 0
      ? [...msgs.slice(0, idx), mergeWorkflowMessage(msgs[idx], wrapper), ...msgs.slice(idx + 1)]
      : [...msgs, wrapper];

  return upsertDataAnalysisEntity(state, dataAnalysisId, { messages: nextMessages } as any);
}


export function patchSelectedAnalysisState(
  state: DataAnalysisState,
  dataAnalysisId: number,
  patch: Partial<SelectedDataAnalysisState>
): DataAnalysisState {
  const selected = state.selectedAnalysis;
  if (!selected || selected.id !== dataAnalysisId) return state;

  return {
    ...state,
    selectedAnalysis: {
      ...selected,
      ...patch,
    },
  };
}

export function removeRunFromSelectedAnalysis(
  state: DataAnalysisState,
  dataAnalysisId: number,
  runId: number,
  workflowId?: number
): DataAnalysisState {
  const selected = state.selectedAnalysis;
  if (!selected || selected.id !== dataAnalysisId) return state;

  const detail: any = selected.detail;
  const nextDetail =
    detail && Array.isArray(detail.messages)
      ? {
        ...detail,
        messages: detail.messages.filter((wrapper: any) => {
          if (wrapper?.type !== 'PREDICTION') return true;

          const message = wrapper?.message;
          if (!message || message.id !== runId) return true;

          if (workflowId != null && message.workflowId !== workflowId) return true;

          return false;
        }),
      }
      : detail;

  return {
    ...state,
    selectedAnalysis: {
      ...selected,
      detail: nextDetail,
    },
  };
}

export function removeRunFromExecution(
  state: DataAnalysisState,
  runId: number
): DataAnalysisState {
  return {
    ...state,
    execution: {
      ...state.execution,
      predictions: state.execution.predictions.filter((p: any) => p?.id !== runId),
      lastPrediction:
        (state.execution.lastPrediction as any)?.id === runId
          ? null
          : state.execution.lastPrediction,
    },
  };
}

export function getExecutionPredictionKey(prediction: Partial<DataAnalysisPredictionDTO> | null | undefined): string | null {
  if (!prediction) {
    return null;
  }

  const workflowRunId = (prediction as any).workflowRunId;
  if (prediction.workflowId != null && workflowRunId != null) {
    if (prediction.id != null) {
      return `workflow:${workflowRunId}:run:${prediction.id}`;
    }

    const stepKey = (prediction as any).currentWorkflowStepId ?? prediction.currentWorkflowStep;
    if (stepKey != null) {
      return `workflow:${workflowRunId}:step:${stepKey}`;
    }

    return `workflow:${workflowRunId}`;
  }

  if (prediction.id != null) {
    return `run:${prediction.id}`;
  }

  if (prediction.workflowId != null && prediction.dataAnalysisId != null) {
    return `workflow-fallback:${prediction.dataAnalysisId}:${prediction.workflowId}`;
  }

  return null;
}

function areSameMessage(
  current: ModelWorkflowChatWrapperDTO,
  next: ModelWorkflowChatWrapperDTO
): boolean {
  if (current.type !== next.type) {
    return false;
  }

  if (current.type === ModelWorkflowChatMessageType.CHAT_MESSAGE) {
    return (current.message as any)?.id === (next.message as any)?.id;
  }

  if (current.type === ModelWorkflowChatMessageType.WORKFLOW_PREDICTION) {
    const currentRunId = (current.message as any)?.workflowRunId;
    const nextRunId = (next.message as any)?.workflowRunId;
    if (currentRunId != null && nextRunId != null) {
      return currentRunId === nextRunId;
    }
  }

  return getExecutionPredictionKey(current.message as DataAnalysisPredictionDTO) ===
    getExecutionPredictionKey(next.message as DataAnalysisPredictionDTO);
}

function mergeWorkflowMessage(
  current: ModelWorkflowChatWrapperDTO,
  next: ModelWorkflowChatWrapperDTO
): ModelWorkflowChatWrapperDTO {
  if (
    current.type !== ModelWorkflowChatMessageType.WORKFLOW_PREDICTION ||
    next.type !== ModelWorkflowChatMessageType.WORKFLOW_PREDICTION
  ) {
    return next;
  }

  return {
    ...next,
    message: mergeWorkflowPrediction(
      current.message as DataAnalysisPredictionDTO,
      next.message as DataAnalysisPredictionDTO
    ),
  };
}

function mergeWorkflowPrediction(
  current: DataAnalysisPredictionDTO,
  next: DataAnalysisPredictionDTO
): DataAnalysisPredictionDTO {
  return {
    ...current,
    ...next,
    inputs: {
      ...(current.inputs ?? {}),
      ...(next.inputs ?? {}),
    },
    hyperParams: {
      ...(current.hyperParams ?? {}),
      ...(next.hyperParams ?? {}),
    },
    result: mergeUnknown(current.result, next.result),
    inputFiles: mergeFiles(current.inputFiles, next.inputFiles),
    outputFiles: mergeFiles(current.outputFiles, next.outputFiles),
  };
}

function mergeFiles<T extends { id?: number }>(current: T[] | undefined, next: T[] | undefined): T[] {
  const merged = [...(current ?? [])];

  for (const item of next ?? []) {
    const idx = item.id == null
      ? -1
      : merged.findIndex((existing) => existing.id === item.id);

    if (idx >= 0) {
      merged[idx] = item;
      continue;
    }

    merged.push(item);
  }

  return merged;
}

function mergeUnknown(current: any, next: any): any {
  if (next == null) {
    return current;
  }

  if (current == null) {
    return next;
  }

  if (Array.isArray(current) && Array.isArray(next)) {
    return [...current, ...next];
  }

  if (isPlainObject(current) && isPlainObject(next)) {
    return {
      ...current,
      ...next,
    };
  }

  return next;
}

function isPlainObject(value: any): value is Record<string, any> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
