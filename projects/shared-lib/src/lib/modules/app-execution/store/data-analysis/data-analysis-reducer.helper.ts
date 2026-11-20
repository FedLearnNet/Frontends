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
import {DataAnalysisRunDTO} from "@shared-lib/modules/app-execution/dto/execution-run";

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
      ? [...msgs.slice(0, idx), wrapper, ...msgs.slice(idx + 1)]
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
  runId: number
): DataAnalysisState {
  const selected = state.selectedAnalysis;
  if (!selected?.detail || selected.id !== dataAnalysisId) return state;

  const messages = (selected.detail.messages ?? []).filter((wrapper) =>
    wrapper.type !== ModelWorkflowChatMessageType.RUN || wrapper.message.id !== runId);

  return upsertDataAnalysisEntity(state, dataAnalysisId, {messages});
}

export function removeRunFromExecution(
  state: DataAnalysisState,
  runId: number
): DataAnalysisState {
  return {
    ...state,
    execution: {
      ...state.execution,
      runs: state.execution.runs.filter((run) => run.id !== runId),
      lastRun: state.execution.lastRun?.id === runId ? null : state.execution.lastRun,
    },
  };
}

// Each event is the whole run, so it replaces the one known by id.
export function upsertExecutionRun(
  state: DataAnalysisState,
  run: DataAnalysisRunDTO
): DataAnalysisState {
  const runs = state.execution.runs;
  const idx = runs.findIndex((known) => known.id === run.id);
  return {
    ...state,
    execution: {
      ...state.execution,
      runs: idx >= 0 ? [...runs.slice(0, idx), run, ...runs.slice(idx + 1)] : [...runs, run],
      lastRun: run,
    },
  };
}

function areSameMessage(
  current: ModelWorkflowChatWrapperDTO,
  next: ModelWorkflowChatWrapperDTO
): boolean {
  return current.type === next.type && current.message?.id === next.message?.id;
}
