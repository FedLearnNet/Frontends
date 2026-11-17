import {createReducer, on} from '@ngrx/store';
import * as TestEngineActions from './test-engine.actions';
import {TestRunDTO} from "../dto/test-run";

export const featureKey = 'testEngines';

export interface TestEngineState {
  appId?: number;
  engines: TestRunDTO[];
  starting: boolean;
  streaming: boolean;
}

export const initialState: TestEngineState = {
  engines: [],
  starting: false,
  streaming: false,
};

function upsert(engines: TestRunDTO[], engine: TestRunDTO): TestRunDTO[] {
  return [engine, ...engines.filter(e => e.id !== engine.id)].sort((a, b) => b.id - a.id);
}

export const testEngineReducer = createReducer(
  initialState,

  on(TestEngineActions.loadTestEngines, (state, {appId}): TestEngineState => ({
    ...state,
    appId,
    engines: state.appId === appId ? state.engines : [],
    streaming: false,
  })),
  on(TestEngineActions.loadTestEnginesSuccess, (state, {appId, engines}): TestEngineState =>
    state.appId !== appId ? state : {...state, engines}),

  on(TestEngineActions.startTestEngine, (state): TestEngineState => ({...state, starting: true})),
  on(TestEngineActions.startTestEngineSuccess, (state, {engine}): TestEngineState => ({
    ...state,
    starting: false,
    engines: upsert(state.engines, engine),
  })),
  on(TestEngineActions.startTestEngineFailure, (state): TestEngineState => ({...state, starting: false})),

  on(TestEngineActions.stopTestEngineSuccess, TestEngineActions.testEngineStreamMessage, (state, {engine}): TestEngineState => ({
    ...state,
    engines: upsert(state.engines, engine),
  })),

  on(TestEngineActions.startTestEngineStream, (state): TestEngineState => ({...state, streaming: true})),
  on(TestEngineActions.stopTestEngineStream, (state): TestEngineState => ({...state, streaming: false})),
  on(TestEngineActions.testEngineStreamError, (state): TestEngineState => ({...state, streaming: false})),
);
