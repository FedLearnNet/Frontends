import {createFeatureSelector, createSelector} from '@ngrx/store';
import {featureKey, TestEngineState} from './test-engine.reducer';
import {connectsAsEngine} from "../dto/test-engine";
import {isFinalStatus} from "@shared-lib/modules/app-execution/dto/execution-run";

export const selectTestEngineState = createFeatureSelector<TestEngineState>(featureKey);

export const selectTestEngines = createSelector(selectTestEngineState, s => s.engines);
export const selectTestEngineStarting = createSelector(selectTestEngineState, s => s.starting);

export const selectConnectingTestEngine = createSelector(selectTestEngines,
  engines => engines.find(e => connectsAsEngine(e) && !isFinalStatus(e.status)));
