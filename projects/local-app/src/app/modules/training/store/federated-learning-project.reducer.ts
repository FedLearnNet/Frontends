import {createReducer, on} from '@ngrx/store';
import {FederatedLearningProjectActions} from './federated-learning-project.actions';
import {FederatedLearningProjectDto} from "../dto/federated-learning-project";
import {RunMessageLogDTO} from "@shared-lib/modules/experiments/dto/log";
import {FederatedLearningExperimentStepDetailDTO} from "../dto/federated-learming-steps";
import {FederatedLearningExperimentDto} from "../dto/federated-learning-experiment";

export interface FederatedLearningProjectState {
  items: FederatedLearningProjectDto[];
  page: number;
  pageSize: number;
  total: number;

  selectedDetail: FederatedLearningProjectDto | null;

  currentStepDetail: FederatedLearningExperimentStepDetailDTO | null;
  currentStepLogs: RunMessageLogDTO[];

  loading: boolean;
  error: any;
  errorById: { [id: number]: any };

  // live connections
  connectedListLive: boolean;
  connectedDetail: boolean;
}

export const initialFederatedLearningProjectState: FederatedLearningProjectState = {
  items: [],
  page: 1,
  pageSize: 10,
  total: 0,

  selectedDetail: null,

  currentStepDetail: null,
  currentStepLogs: [],

  loading: false,
  error: null,
  errorById: {},

  connectedListLive: false,
  connectedDetail: false
};

export const featureKey = 'federatedLearningProject';

function findAndUpdateStep(experiment: FederatedLearningExperimentDto | null, step: FederatedLearningExperimentStepDetailDTO | null, stepId: number | undefined): FederatedLearningExperimentStepDetailDTO | null {
  if (!experiment) return null;
  if (!stepId) return null;
  const steps = experiment?.steps || [];
  const initialStep = Array.isArray(steps) ? steps.find((s: any) => s?.id === stepId) : null;
  if (initialStep === null) return step;
  if (step === null) return initialStep as any ?? null;
  return {
    ...step,
    ...initialStep,
  } as FederatedLearningExperimentStepDetailDTO
}

function upsert(list: FederatedLearningProjectDto[], item: FederatedLearningProjectDto) {
  const idx = list.findIndex(x => x.experiment.id === item.experiment.id);
  if (idx === -1) return [...list, item];
  const next = [...list];
  next[idx] = {...next[idx], ...item};
  return next;
}

export const federatedLearningProjectReducer = createReducer(
  initialFederatedLearningProjectState,

  on(FederatedLearningProjectActions.loadList, (s, {page, pageSize}): FederatedLearningProjectState => ({
    ...s,
    loading: true,
    error: null,
    page: page ?? s.page,
    pageSize: pageSize ?? s.pageSize,
  })),
  on(FederatedLearningProjectActions.loadListSuccess, (s, {
    items,
    page,
    pageSize,
    total
  }): FederatedLearningProjectState => ({
    ...s,
    items,
    page,
    pageSize,
    total,
    loading: false,
    error: null,
  })),
  on(FederatedLearningProjectActions.loadListFailure, (s, {error}): FederatedLearningProjectState => ({
    ...s, loading: false, error
  })),

  on(FederatedLearningProjectActions.loadDetail, (s): FederatedLearningProjectState => ({
    ...s, loading: true, error: null
  })),
  on(FederatedLearningProjectActions.loadDetailSuccess, (s, {detail}): FederatedLearningProjectState => ({
    ...s,
    items: upsert(s.items, detail),
    selectedDetail: detail,
    loading: false,
    error: null,
    errorById: {...s.errorById, [detail.experiment.id]: null},
  })),
  on(FederatedLearningProjectActions.loadDetailFailure, (s, {id, error}): FederatedLearningProjectState => ({
    ...s,
    loading: false,
    error,
    errorById: {...s.errorById, [id]: error},
  })),
  on(FederatedLearningProjectActions.exportPatientsFailure, (s, {error}): FederatedLearningProjectState => ({
    ...s,
    loading: false,
    error
  })),
  on(FederatedLearningProjectActions.liveConnected, (s, {channel, id}): FederatedLearningProjectState => {
    if (channel === 'list') {
      return {...s, connectedListLive: true};
    }
    if (channel === 'detail' && id != null) {
      return {...s, connectedDetail: true};
    }
    return s;
  }),

  on(FederatedLearningProjectActions.liveDisconnected, (s, {channel, id}): FederatedLearningProjectState => {
    if (channel === 'list') {
      return {...s, connectedListLive: false};
    }
    if (channel === 'detail' && id != null) {
      return {...s, connectedDetail: false};
    }
    return s;
  }),

  on(FederatedLearningProjectActions.liveError, (s, {channel, id, error}): FederatedLearningProjectState => {
    if (channel === 'detail' && id != null) {
      return {
        ...s,
        error,
        errorById: {...s.errorById, [id]: error},
      };
    }
    return {...s, error};
  }),

  on(FederatedLearningProjectActions.liveEvent, (s, {payload}): FederatedLearningProjectState => {
    const isDetail = 'description' in payload || 'detailOnlyField' in payload;
    if (isDetail) {
      const detail = payload as FederatedLearningProjectDto;
      return {
        ...s,
        items: upsert(s.items, detail),
        selectedDetail:
          s.selectedDetail?.experiment.id === detail.experiment.id ? detail : s.selectedDetail,
      };
    }
    return {
      ...s,
      items: upsert(s.items, payload as FederatedLearningProjectDto),
    };
  }),

  on(FederatedLearningProjectActions.loadStepDetail, (state, {
    stepId
  }): FederatedLearningProjectState => {
    return {
      ...state,
      loading: true,
      error: null,
      currentStepDetail: findAndUpdateStep(state.selectedDetail!.experiment!, null, stepId),
    };
  }),
  on(FederatedLearningProjectActions.loadStepDetailSuccess, (state, {
    detail
  }): FederatedLearningProjectState => ({
    ...state,
    currentStepDetail: detail,
    currentStepLogs: detail?.logs ?? [],
    loading: false,
    error: null,
  })),
  on(FederatedLearningProjectActions.loadStepDetailError, (state, {
    error
  }): FederatedLearningProjectState => ({
    ...state,
    loading: false,
    error,
  })),
  on(FederatedLearningProjectActions.loadStepMessages, (state): FederatedLearningProjectState => ({
    ...state,
    error: null,
    currentStepLogs: state.currentStepDetail?.logs ?? [],
  })),
  on(FederatedLearningProjectActions.loadStepMessagesSuccess, (state, {
    message
  }): FederatedLearningProjectState => ({
    ...state,
    currentStepLogs: message ? [...state.currentStepLogs, message] : state.currentStepLogs,
    error: null,
  })),
  on(FederatedLearningProjectActions.loadStepMessagesError, (state, {
    error
  }): FederatedLearningProjectState => ({
    ...state,
    error,
  })),

  on(FederatedLearningProjectActions.resetErrors, (s): FederatedLearningProjectState => ({
    ...s, error: null, errorById: {}
  })),
);
