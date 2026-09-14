import {createReducer, on} from '@ngrx/store';
import {
  ProjectFederatedExperimentDetailDTO,
  ProjectFederatedExperimentDTO,
  ProjectFederatedExperimentStepDetailDTO
} from "@global-app/project/dto/project-experiments";
import {RunMessageLogDTO} from "@shared-lib/modules/experiments/dto/log";
import {ProjectFederatedExperimentsActions} from "@global-app/project/store/project-federated-experiments.actions";

export interface ProjectFederatedExperimentState {
  experiments: ProjectFederatedExperimentDTO[];
  selectedExperiment: ProjectFederatedExperimentDetailDTO | null;

  currentStepDetail: ProjectFederatedExperimentStepDetailDTO | null;
  currentStepLogs: RunMessageLogDTO[];

  loading: boolean;
  error: any;
  errorById: { [id: number]: any };
  connectedById: { [id: number]: boolean };
}

export const initialProjectFederatedExperimentState: ProjectFederatedExperimentState = {
  experiments: [],
  selectedExperiment: null,
  currentStepLogs: [],
  currentStepDetail: null,
  loading: false,
  error: null,
  errorById: {},
  connectedById: {},
};

export const featureKey = 'projectFederatedExperiments';

function upsert(list: ProjectFederatedExperimentDTO[], item: ProjectFederatedExperimentDTO) {
  if (!item?.id) return list;
  const idx = list.findIndex(e => e.id === item.id);
  if (idx === -1) return [item, ...list];
  const next = [...list];
  next[idx] = item;
  return next;
}

function replaceProjectList(
  list: ProjectFederatedExperimentDTO[],
  projectId: number,
  items: ProjectFederatedExperimentDTO[]
) {
  const others = list.filter(e => e.projectId !== projectId);
  return [...others, ...items];
}

function findAndUpdateStep(experiment: ProjectFederatedExperimentDTO | null, step: ProjectFederatedExperimentStepDetailDTO | null, stepId: number | undefined): ProjectFederatedExperimentStepDetailDTO | null {
  if (!experiment) return null;
  if (!stepId) return null;
  const steps = experiment?.steps || [];
  const initialStep = Array.isArray(steps) ? steps.find((s: any) => s?.id === stepId) : null;
  if (initialStep === null) return step;
  if (step === null) return initialStep as ProjectFederatedExperimentStepDetailDTO ?? null;
  return {
    ...step,
    ...initialStep,
  } as any
}

export const projectFederatedExperimentReducer = createReducer(
  initialProjectFederatedExperimentState,

  on(ProjectFederatedExperimentsActions.loadList, (state): ProjectFederatedExperimentState => ({
    ...state, loading: true, error: null,
  })),
  on(ProjectFederatedExperimentsActions.loadListSuccess, (state, {
    projectId,
    items
  }): ProjectFederatedExperimentState => ({
    ...state,
    experiments: replaceProjectList(state.experiments, projectId, items),
    loading: false,
    error: null,
  })),

  on(ProjectFederatedExperimentsActions.loadListError, (state, {error}): ProjectFederatedExperimentState => ({
    ...state, loading: false, error,
  })),

  on(ProjectFederatedExperimentsActions.loadExperiment, (state): ProjectFederatedExperimentState => ({
    ...state,
    selectedExperiment: null,
    loading: true,
    error: null,
  })),
  on(ProjectFederatedExperimentsActions.loadExperimentSuccess, (state, {experiment}): ProjectFederatedExperimentState => ({
    ...state,
    experiments: experiment?.id ? upsert(state.experiments, experiment) : state.experiments,
    selectedExperiment: experiment?.id ? experiment : state.selectedExperiment,
    currentStepDetail: findAndUpdateStep(state.selectedExperiment, state.currentStepDetail, state.currentStepDetail?.id),
    loading: false,
    error: null,
    errorById: {...state.errorById, [experiment.id!]: null},
  })),

  on(ProjectFederatedExperimentsActions.loadExperimentError, (state, {id, error}): ProjectFederatedExperimentState => ({
    ...state,
    loading: false,
    error,
    errorById: {...state.errorById, [id]: error},
  })),

  on(ProjectFederatedExperimentsActions.create, (state): ProjectFederatedExperimentState => ({
    ...state, loading: true, error: null,
  })),
  on(ProjectFederatedExperimentsActions.createSuccess, (state, {item}): ProjectFederatedExperimentState => ({
    ...state,
    experiments: upsert(state.experiments, item),
    selectedExperiment: item,
    loading: false,
    error: null,
    errorById: {...state.errorById, [item.id!]: null},
  })),

  on(ProjectFederatedExperimentsActions.createError, (state, {error}): ProjectFederatedExperimentState => ({
    ...state, loading: false, error,
  })),

  on(ProjectFederatedExperimentsActions.startExperiment, (s): ProjectFederatedExperimentState => ({
    ...s,
    loading: true,
    error: null
  })),
  on(ProjectFederatedExperimentsActions.startExperimentSuccess, (s, {experiment}): ProjectFederatedExperimentState => ({
    ...s,
    loading: false,
    selectedExperiment: experiment,
    currentStepDetail: findAndUpdateStep(s.selectedExperiment, s.currentStepDetail, s.currentStepDetail?.id),
    error: null
  })),
  on(ProjectFederatedExperimentsActions.startExperimentFailure, (s, {error}): ProjectFederatedExperimentState => ({
    ...s,
    loading: false,
    error
  })),

  on(ProjectFederatedExperimentsActions.stopExperiment, (s): ProjectFederatedExperimentState => ({
    ...s,
    loading: true,
    error: null
  })),
  on(ProjectFederatedExperimentsActions.stopExperimentSuccess, (s, {experiment}): ProjectFederatedExperimentState => ({
    ...s, loading: false, error: null,
    selectedExperiment: experiment,
    currentStepDetail: findAndUpdateStep(s.selectedExperiment, s.currentStepDetail, s.currentStepDetail?.id),
  })),
  on(ProjectFederatedExperimentsActions.stopExperimentFailure, (s, {error}): ProjectFederatedExperimentState => ({
    ...s,
    loading: false,
    error
  })),

  on(ProjectFederatedExperimentsActions.liveConnected, (state, {experimentId}): ProjectFederatedExperimentState => {
    const connectedById = {...state.connectedById};
    if (experimentId != null) connectedById[experimentId] = true;
    return {...state, connectedById};
  }),
  on(ProjectFederatedExperimentsActions.liveError, (state, {experimentId, error}): ProjectFederatedExperimentState => ({
    ...state,
    error,
    errorById: experimentId != null ? {...state.errorById, [experimentId]: error} : state.errorById,
  })),

  on(ProjectFederatedExperimentsActions.liveDisconnected, (state, {experimentId}): ProjectFederatedExperimentState => {
    const connectedById = {...state.connectedById};
    if (experimentId != null) connectedById[experimentId] = false;
    return {...state, connectedById};
  }),

  on(ProjectFederatedExperimentsActions.resetErrors, (state): ProjectFederatedExperimentState => ({
    ...state, error: null, errorById: {},
  })),

  on(ProjectFederatedExperimentsActions.loadStepDetail, (state, {
    stepId
  }): ProjectFederatedExperimentState => {
    return {
      ...state,
      loading: true,
      error: null,
      currentStepDetail: findAndUpdateStep(state.selectedExperiment, null, stepId),
    };
  }),
  on(ProjectFederatedExperimentsActions.loadStepDetailSuccess, (state, {
    detail
  }): ProjectFederatedExperimentState => ({
    ...state,
    currentStepDetail: detail,
    currentStepLogs: detail?.logMessages ?? [],
    loading: false,
    error: null,
  })),
  on(ProjectFederatedExperimentsActions.loadStepDetailError, (state, {
    error
  }): ProjectFederatedExperimentState => ({
    ...state,
    loading: false,
    error,
  })),
  on(ProjectFederatedExperimentsActions.loadStepMessages, (state): ProjectFederatedExperimentState => ({
    ...state,
    error: null,
    currentStepLogs: state.currentStepDetail?.logMessages ?? [],
  })),
  on(ProjectFederatedExperimentsActions.loadStepMessagesSuccess, (state, {
    message
  }): ProjectFederatedExperimentState => ({
    ...state,
    currentStepLogs: message ? [...state.currentStepLogs, message] : state.currentStepLogs,
    error: null,
  })),
  on(ProjectFederatedExperimentsActions.loadStepMessagesError, (state, {
    error
  }): ProjectFederatedExperimentState => ({
    ...state,
    error,
  })),
);
