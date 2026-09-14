import {createReducer, on} from '@ngrx/store';
import * as PipelineActions from './pipeline.actions';
import {PipelineDTO} from "../dto/pipeline";

export const featureKey = 'pipelines';

export interface PipelineState {
  pipelines: PipelineDTO[];
  byId: { [id: number]: PipelineDTO };
  current?: PipelineDTO;
  loading: boolean;
  streaming: boolean;
  error: any;
}

export const initialState: PipelineState = {
  pipelines: [],
  byId: {},
  loading: false,
  streaming: false,
  error: null,
};

export const pipelineReducer = createReducer(
  initialState,

  on(PipelineActions.loadPipelines, (state): PipelineState => ({...state, loading: true, error: null})),
  on(PipelineActions.loadPipelinesSuccess, (state, {pipelines}): PipelineState => ({
    ...state,
    loading: false,
    pipelines,
    byId: pipelines.reduce((acc, p) => (p.id != null ? {...acc, [p.id]: p} : acc), {}),
  })),
  on(PipelineActions.loadPipelinesFailure, (state, {error}): PipelineState => ({...state, loading: false, error})),

  on(PipelineActions.getPipeline, (state): PipelineState => ({...state, loading: true, error: null})),
  on(PipelineActions.getPipelineSuccess, (state, {pipeline}): PipelineState => ({
    ...state,
    loading: false,
    current: pipeline,
    byId: pipeline.id != null ? {...state.byId, [pipeline.id]: pipeline} : state.byId,
    pipelines: pipeline.id != null
      ? upsert(state.pipelines, pipeline)
      : state.pipelines,
  })),
  on(PipelineActions.getPipelineFailure, (state, {error}): PipelineState => ({...state, loading: false, error})),

  on(PipelineActions.createPipeline, (state): PipelineState => ({...state, loading: true, error: null})),
  on(PipelineActions.createPipelineSuccess, (state, {pipeline}): PipelineState => ({
    ...state,
    loading: false,
    current: pipeline,
    byId: pipeline.id != null ? {...state.byId, [pipeline.id]: pipeline} : state.byId,
    pipelines: pipeline.id != null
      ? upsert(state.pipelines, pipeline)
      : state.pipelines,
  })),
  on(PipelineActions.createPipelineFailure, (state, {error}): PipelineState => ({...state, loading: false, error})),

  on(PipelineActions.startPipelineStream, (state): PipelineState => ({...state, streaming: true})),
  on(PipelineActions.stopPipelineStream, (state): PipelineState => ({...state, streaming: false})),
  on(PipelineActions.pipelineStreamMessage, (state, {pipeline}): PipelineState => ({
    ...state,
    current: pipeline.id === state.current?.id ? pipeline : state.current,
    byId: pipeline.id != null ? {...state.byId, [pipeline.id]: pipeline} : state.byId,
    pipelines: pipeline.id != null
      ? upsert(state.pipelines, pipeline)
      : state.pipelines,
  })),
  on(PipelineActions.pipelineStreamError, (state, {error}): PipelineState => ({...state, streaming: false, error})),
  on(PipelineActions.stopPipeline, (state): PipelineState => ({...state, loading: true, error: null})),
  on(PipelineActions.stopPipelineSuccess, (state, {pipeline}): PipelineState => ({
    ...state,
    loading: false,
    current: pipeline.id === state.current?.id ? pipeline : state.current,
    byId: pipeline.id != null ? {...state.byId, [pipeline.id]: pipeline} : state.byId,
    pipelines: pipeline.id != null ? upsert(state.pipelines, pipeline) : state.pipelines,
  })),
  on(PipelineActions.stopPipelineFailure, (state, {error}): PipelineState => ({...state, loading: false, error})),
);

function upsert(list: PipelineDTO[], item: PipelineDTO): PipelineDTO[] {
  const idx = item.id != null ? list.findIndex(x => x.id === item.id) : -1;
  if (idx === -1) return [item, ...list];
  const copy = list.slice();
  copy[idx] = item;
  return copy;
}
