import {createReducer, on} from '@ngrx/store';
import {FederatedLearningProjectActions} from './federated-learning-project.actions';
import {FederatedLearningProjectDto} from "../dto/federated-learning-project";
import {ExecutionRunDetailDTO} from "@shared-lib/modules/app-execution/dto/execution-run";

export interface FederatedLearningProjectState {
  items: FederatedLearningProjectDto[];
  page: number;
  pageSize: number;
  total: number;

  selectedDetail: FederatedLearningProjectDto | null;
  runDetail: ExecutionRunDetailDTO | null;

  loading: boolean;
  error: any;
  connectedDetail: boolean;
}

export const initialFederatedLearningProjectState: FederatedLearningProjectState = {
  items: [],
  page: 1,
  pageSize: 10,
  total: 0,
  selectedDetail: null,
  runDetail: null,
  loading: false,
  error: null,
  connectedDetail: false
};

export const featureKey = 'federatedLearningProject';

function upsert(list: FederatedLearningProjectDto[], item: FederatedLearningProjectDto) {
  const index = list.findIndex(other => other.project.id === item.project.id);
  if (index === -1) return [...list, item];
  const next = [...list];
  next[index] = {...next[index], ...item};
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
  on(FederatedLearningProjectActions.loadListSuccess, (s, {items, page, pageSize, total}): FederatedLearningProjectState => ({
    ...s, items, page, pageSize, total, loading: false, error: null,
  })),
  on(FederatedLearningProjectActions.loadDetail, (s, {id}): FederatedLearningProjectState => ({
    ...s,
    loading: true,
    error: null,
    runDetail: s.runDetail && s.selectedDetail?.project.id === id ? s.runDetail : null,
  })),
  on(FederatedLearningProjectActions.loadDetailSuccess, (s, {detail}): FederatedLearningProjectState => ({
    ...s,
    items: upsert(s.items, detail),
    selectedDetail: detail,
    loading: false,
    error: null,
  })),
  on(FederatedLearningProjectActions.followRun, (s): FederatedLearningProjectState => ({...s, connectedDetail: true})),
  on(FederatedLearningProjectActions.followRunEnded, (s): FederatedLearningProjectState => ({...s, connectedDetail: false})),
  on(FederatedLearningProjectActions.runChanged, (s, {id, run}): FederatedLearningProjectState => {
    const selectedDetail = s.selectedDetail?.project.id === id ? {...s.selectedDetail, run} : s.selectedDetail;
    return {
      ...s,
      selectedDetail,
      items: s.items.map(item => item.project.id === id ? {...item, run} : item),
    };
  }),
  on(FederatedLearningProjectActions.loadRunDetailSuccess, (s, {run}): FederatedLearningProjectState => ({...s, runDetail: run})),
  on(FederatedLearningProjectActions.loadListFailure, FederatedLearningProjectActions.loadDetailFailure,
    FederatedLearningProjectActions.exportPatientsFailure, FederatedLearningProjectActions.loadRunDetailFailure,
    (s, {error}): FederatedLearningProjectState => ({...s, loading: false, error})),
  on(FederatedLearningProjectActions.resetErrors, (s): FederatedLearningProjectState => ({...s, error: null})),
);
