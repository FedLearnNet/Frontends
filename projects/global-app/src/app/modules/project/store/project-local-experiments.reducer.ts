import {createReducer, on} from '@ngrx/store';
import {
  ProjectLocalExperimentDTO,
  ProjectLocalExperimentStepDetailDTO
} from "@global-app/project/dto/project-experiments";
import {ProjectLocalExperimentsActions} from "@global-app/project/store/project-local-experiments.actions";
import {RunMessageLogDTO} from "@shared-lib/modules/experiments/dto/log";

export interface ProjectLocalExperimentState {
  experiments: ProjectLocalExperimentDTO[];
  selectedExperiment: ProjectLocalExperimentDTO | null;

  currentStepDetail: ProjectLocalExperimentStepDetailDTO | null;
  currentStepLogs: RunMessageLogDTO[];

  loading: boolean;
  error: any;
  errorById: { [id: number]: any };
  connectedById: { [id: number]: boolean };

  connectedTestExperiment: boolean;
}

export const initialProjectLocalExperimentState: ProjectLocalExperimentState = {
  experiments: [],
  selectedExperiment: null,
  currentStepLogs: [],
  currentStepDetail: null,
  loading: false,
  error: null,
  errorById: {},
  connectedById: {},
  connectedTestExperiment: false,
};

export const featureKey = 'projectLocalExperiments';

function upsert(list: ProjectLocalExperimentDTO[], item: ProjectLocalExperimentDTO) {
  if (!item?.id) return list;
  const idx = list.findIndex(e => e.id === item.id);
  if (idx === -1) return [...list, item];
  const next = [...list];
  next[idx] = item;
  return next;
}

function replaceProjectList(
  list: ProjectLocalExperimentDTO[],
  projectId: number,
  items: ProjectLocalExperimentDTO[]
) {
  const others = list.filter(e => e.projectId !== projectId);
  return [...others, ...items];
}

function findAndUpdateStep(experiment: ProjectLocalExperimentDTO | null, step: ProjectLocalExperimentStepDetailDTO | null, stepId: number | undefined): ProjectLocalExperimentStepDetailDTO | null {
  if (!experiment) return null;
  if (!stepId) return null;
  const steps = experiment?.steps || [];
  const initialStep = Array.isArray(steps) ? steps.find((s: any) => s?.id === stepId) : null;
  if (initialStep === null) return step;
  if (step === null) return initialStep as ProjectLocalExperimentStepDetailDTO ?? null;
  return {
    ...step,
    ...initialStep,
  }
}

export const projectLocalExperimentReducer = createReducer(
  initialProjectLocalExperimentState,

  on(ProjectLocalExperimentsActions.loadList, (state): ProjectLocalExperimentState => ({
    ...state, loading: true, error: null,
  })),
  on(ProjectLocalExperimentsActions.loadListSuccess, (state, {projectId, items}): ProjectLocalExperimentState => ({
    ...state,
    experiments: replaceProjectList(state.experiments, projectId, items),
    loading: false,
    error: null,
  })),

  on(ProjectLocalExperimentsActions.loadListError, (state, {error}): ProjectLocalExperimentState => ({
    ...state, loading: false, error,
  })),

  on(ProjectLocalExperimentsActions.loadExperiment, (state): ProjectLocalExperimentState => ({
    ...state,
    selectedExperiment: null,
    loading: true,
    error: null,
  })),
  on(ProjectLocalExperimentsActions.loadExperimentSuccess, (state, {experiment}): ProjectLocalExperimentState => ({
    ...state,
    experiments: experiment?.id ? upsert(state.experiments, experiment) : state.experiments,
    selectedExperiment: experiment?.id ? experiment : state.selectedExperiment,
    currentStepDetail: findAndUpdateStep(state.selectedExperiment, state.currentStepDetail, state.currentStepDetail?.id),
    loading: false,
    error: null,
    errorById: {...state.errorById, [experiment.id!]: null},
  })),

  on(ProjectLocalExperimentsActions.loadExperimentError, (state, {id, error}): ProjectLocalExperimentState => ({
    ...state,
    loading: false,
    error,
    errorById: {...state.errorById, [id]: error},
  })),

  on(ProjectLocalExperimentsActions.loadExperimentTest, (state): ProjectLocalExperimentState => ({
    ...state,
    selectedExperiment: null,
    loading: true,
    error: null,
  })),

  on(ProjectLocalExperimentsActions.loadExperimentTestSuccess, (state, {experiment}): ProjectLocalExperimentState => ({
    ...state,
    selectedExperiment: experiment,
    currentStepDetail: findAndUpdateStep(state.selectedExperiment, state.currentStepDetail, state.currentStepDetail?.id),
    loading: false,
    error: null,
  })),
  on(ProjectLocalExperimentsActions.loadExperimentTestError, (state, {error}): ProjectLocalExperimentState => ({
    ...state, loading: false, error,
  })),

  on(ProjectLocalExperimentsActions.create, (state): ProjectLocalExperimentState => ({
    ...state, loading: true, error: null,
  })),
  on(ProjectLocalExperimentsActions.createSuccess, (state, {item}): ProjectLocalExperimentState => ({
    ...state,
    experiments: upsert(state.experiments, item),
    selectedExperiment: item,
    loading: false,
    error: null,
    errorById: {...state.errorById, [item.id!]: null},
  })),

  on(ProjectLocalExperimentsActions.createError, (state, {error}): ProjectLocalExperimentState => ({
    ...state, loading: false, error,
  })),

  on(ProjectLocalExperimentsActions.startLocalExperiment, (s): ProjectLocalExperimentState => ({
    ...s,
    loading: true,
    error: null
  })),
  on(ProjectLocalExperimentsActions.startLocalExperimentSuccess, (s, {experiment}): ProjectLocalExperimentState => ({
    ...s,
    loading: false,
    selectedExperiment: experiment,
    currentStepDetail: findAndUpdateStep(s.selectedExperiment, s.currentStepDetail, s.currentStepDetail?.id),
    error: null
  })),
  on(ProjectLocalExperimentsActions.startLocalExperimentFailure, (s, {error}): ProjectLocalExperimentState => ({
    ...s,
    loading: false,
    error
  })),

  on(ProjectLocalExperimentsActions.stopLocalExperiment, (s): ProjectLocalExperimentState => ({
    ...s,
    loading: true,
    error: null
  })),
  on(ProjectLocalExperimentsActions.stopLocalExperimentSuccess, (s, {experiment}): ProjectLocalExperimentState => ({
    ...s, loading: false, error: null,
    selectedExperiment: experiment,
    currentStepDetail: findAndUpdateStep(s.selectedExperiment, s.currentStepDetail, s.currentStepDetail?.id),
  })),
  on(ProjectLocalExperimentsActions.stopLocalExperimentFailure, (s, {error}): ProjectLocalExperimentState => ({
    ...s,
    loading: false,
    error
  })),

  on(ProjectLocalExperimentsActions.createTest, (state): ProjectLocalExperimentState => ({
    ...state, loading: true, error: null,
  })),
  on(ProjectLocalExperimentsActions.createTestSuccess, (state, {item}): ProjectLocalExperimentState => ({
    ...state,
    selectedExperiment: item,
    loading: false,
    error: null,
  })),

  on(ProjectLocalExperimentsActions.createTestError, (state, {error}): ProjectLocalExperimentState => ({
    ...state, loading: false, error,
  })),

  on(ProjectLocalExperimentsActions.liveConnected, (state, {experimentId, channel}): ProjectLocalExperimentState => {
    if (channel === 'test') {
      return {
        ...state,
        connectedTestExperiment: true
      };
    }
    const connectedById = {...state.connectedById};
    if (experimentId != null) connectedById[experimentId] = true;
    return {...state, connectedById};
  }),
  on(ProjectLocalExperimentsActions.liveError, (state, {experimentId, error}): ProjectLocalExperimentState => ({
    ...state,
    error,
    errorById: experimentId != null ? {...state.errorById, [experimentId]: error} : state.errorById,
  })),

  on(ProjectLocalExperimentsActions.liveDisconnected, (state, {experimentId, channel}): ProjectLocalExperimentState => {
    if (channel === 'test') {
      return {
        ...state,
        connectedTestExperiment: false
      };
    }
    const connectedById = {...state.connectedById};
    if (experimentId != null) connectedById[experimentId] = false;
    return {...state, connectedById};
  }),

  on(ProjectLocalExperimentsActions.resetErrors, (state): ProjectLocalExperimentState => ({
    ...state, error: null, errorById: {},
  })),

  on(ProjectLocalExperimentsActions.loadLocalStepDetail, (state, {
    stepId
  }): ProjectLocalExperimentState => {
    return {
      ...state,
      loading: true,
      error: null,
      currentStepDetail: findAndUpdateStep(state.selectedExperiment, null, stepId),
    };
  }),
  on(ProjectLocalExperimentsActions.loadLocalStepDetailSuccess, (state, {
    detail
  }): ProjectLocalExperimentState => ({
    ...state,
    currentStepDetail: detail,
    currentStepLogs: detail?.logMessages ?? [],
    loading: false,
    error: null,
  })),
  on(ProjectLocalExperimentsActions.loadLocalStepDetailError, (state, {
    error
  }): ProjectLocalExperimentState => ({
    ...state,
    loading: false,
    error,
  })),
  on(ProjectLocalExperimentsActions.loadLocalStepMessages, (state): ProjectLocalExperimentState => ({
    ...state,
    error: null,
    currentStepLogs: state.currentStepDetail?.logMessages ?? [],
  })),
  on(ProjectLocalExperimentsActions.loadLocalStepMessagesSuccess, (state, {
    message
  }): ProjectLocalExperimentState => ({
    ...state,
    currentStepLogs: message ? [...state.currentStepLogs, message] : state.currentStepLogs,
    error: null,
  })),
  on(ProjectLocalExperimentsActions.loadLocalStepMessagesError, (state, {
    error
  }): ProjectLocalExperimentState => ({
    ...state,
    error,
  })),
);
