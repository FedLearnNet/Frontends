import {createReducer, on} from '@ngrx/store';
import {ProjectRunDTO, projectIdOf} from "@global-app/project/dto/project-experiments";
import {ProjectRunsActions} from "@global-app/project/store/project-runs.actions";
import {ExecutionMode} from "@shared-lib/modules/app-execution/dto/execution-run";

export interface ProjectRunsState {
  runs: ProjectRunDTO[];
  selectedRun: ProjectRunDTO | null;
  selectedRunDetail: ProjectRunDTO | null;
  testRun: ProjectRunDTO | null;
  loading: boolean;
  error: any;
  connectedById: { [id: number]: boolean };
  testConnected: boolean;
}

export const initialProjectRunsState: ProjectRunsState = {
  runs: [],
  selectedRun: null,
  selectedRunDetail: null,
  testRun: null,
  loading: false,
  error: null,
  connectedById: {},
  testConnected: false,
};

export const featureKey = 'projectRuns';

function upsert(list: ProjectRunDTO[], run: ProjectRunDTO): ProjectRunDTO[] {
  const index = list.findIndex(other => other.id === run.id);
  if (index === -1) return [run, ...list];
  const next = [...list];
  next[index] = run;
  return next;
}

// A run changed: in the list, and as the followed run.
function changed(state: ProjectRunsState, run: ProjectRunDTO): ProjectRunsState {
  return {
    ...state,
    runs: run.experiment?.test ? state.runs : upsert(state.runs, run),
    selectedRun: state.selectedRun?.id === run.id || !state.selectedRun ? run : state.selectedRun,
    loading: false,
    error: null,
  };
}

export const projectRunsReducer = createReducer(
  initialProjectRunsState,

  on(ProjectRunsActions.loadList, (state): ProjectRunsState => ({...state, loading: true, error: null})),
  on(ProjectRunsActions.loadListSuccess, (state, {projectId, kind, runs}): ProjectRunsState => ({
    ...state,
    runs: [
      ...state.runs.filter(run => projectIdOf(run) !== projectId || (run.mode === ExecutionMode.FEDERATED) !== (kind === 'federated')),
      ...runs,
    ],
    loading: false,
    error: null,
  })),

  on(ProjectRunsActions.create, ProjectRunsActions.start, ProjectRunsActions.stop, ProjectRunsActions.createTest,
    (state): ProjectRunsState => ({...state, loading: true, error: null})),

  on(ProjectRunsActions.follow, (state, {runId}): ProjectRunsState => ({
    ...state,
    selectedRun: state.selectedRun?.id === runId ? state.selectedRun : state.runs.find(run => run.id === runId) ?? null,
    selectedRunDetail: state.selectedRunDetail?.id === runId ? state.selectedRunDetail : null,
    connectedById: {...state.connectedById, [runId]: true},
  })),
  on(ProjectRunsActions.followEnded, (state, {runId}): ProjectRunsState => ({
    ...state,
    connectedById: {...state.connectedById, [runId]: false},
  })),
  on(ProjectRunsActions.runChanged, (state, {run}): ProjectRunsState => changed(state, run)),

  on(ProjectRunsActions.followTest, (state): ProjectRunsState => ({...state, testConnected: true})),
  on(ProjectRunsActions.followTestEnded, (state): ProjectRunsState => ({...state, testConnected: false})),
  on(ProjectRunsActions.testChanged, (state, {run}): ProjectRunsState => ({...state, testRun: run, loading: false, error: null})),

  on(ProjectRunsActions.loadDetailSuccess, (state, {run}): ProjectRunsState => ({...state, selectedRunDetail: run})),

  on(ProjectRunsActions.failure, (state, {error}): ProjectRunsState => ({...state, loading: false, error})),
);
