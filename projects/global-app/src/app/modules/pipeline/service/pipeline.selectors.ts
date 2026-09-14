import {createFeatureSelector, createSelector} from '@ngrx/store';
import {featureKey, PipelineState} from './pipeline.reducer';

export const selectPipelineState = createFeatureSelector<PipelineState>(featureKey);

export const selectLoading = createSelector(selectPipelineState, s => s.loading);
export const selectStreaming = createSelector(selectPipelineState, s => s.streaming);
export const selectError = createSelector(selectPipelineState, s => s.error);

export const selectAllPipelines = createSelector(selectPipelineState, s => s.pipelines);
export const selectById = (id: number) => createSelector(selectPipelineState, s => s.byId[id]);
export const selectCurrent = createSelector(selectPipelineState, s => s.current);
