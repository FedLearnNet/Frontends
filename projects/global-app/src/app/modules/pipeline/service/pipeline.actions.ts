import { createAction, props } from '@ngrx/store';
import {PipelineCreateDTO, PipelineDTO} from "../dto/pipeline";

export const loadPipelines = createAction(
  '[Pipeline] Load Pipelines',
  props<{ appVersionId?: number; appId?: number; modelSubId?: number }>()
);
export const loadPipelinesSuccess = createAction(
  '[Pipeline] Load Pipelines Success',
  props<{ pipelines: PipelineDTO[] }>()
);
export const loadPipelinesFailure = createAction(
  '[Pipeline] Load Pipelines Failure',
  props<{ error: any }>()
);

export const getPipeline = createAction(
  '[Pipeline] Get Pipeline',
  props<{ id: number }>()
);
export const getPipelineSuccess = createAction(
  '[Pipeline] Get Pipeline Success',
  props<{ pipeline: PipelineDTO }>()
);
export const getPipelineFailure = createAction(
  '[Pipeline] Get Pipeline Failure',
  props<{ error: any }>()
);

export const createPipeline = createAction(
  '[Pipeline] Create Pipeline',
  props<{ request: PipelineCreateDTO }>()
);
export const createPipelineSuccess = createAction(
  '[Pipeline] Create Pipeline Success',
  props<{ pipeline: PipelineDTO }>()
);
export const createPipelineFailure = createAction(
  '[Pipeline] Create Pipeline Failure',
  props<{ error: any }>()
);

export const startPipelineStream = createAction(
  '[Pipeline] Start Stream',
  props<{ id: number }>()
);
export const stopPipelineStream = createAction(
  '[Pipeline] Stop Stream'
);
export const pipelineStreamMessage = createAction(
  '[Pipeline] Stream Message',
  props<{ pipeline: PipelineDTO }>()
);
export const pipelineStreamError = createAction(
  '[Pipeline] Stream Error',
  props<{ error: any }>()
);


export const stopPipeline = createAction(
  '[Pipeline] Stop Pipeline',
  props<{ id: number }>()
);

export const stopPipelineSuccess = createAction(
  '[Pipeline] Stop Pipeline Success',
  props<{ pipeline: PipelineDTO }>()
);

export const stopPipelineFailure = createAction(
  '[Pipeline] Stop Pipeline Failure',
  props<{ error: any }>()
);
