import {createAction, props} from '@ngrx/store';
import {TestEngineCreateDTO} from "../dto/test-engine";
import {TestRunDTO} from "../dto/test-run";

export const loadTestEngines = createAction(
  '[TestEngine] Load',
  props<{ appId: number }>()
);
export const loadTestEnginesSuccess = createAction(
  '[TestEngine] Load Success',
  props<{ appId: number; engines: TestRunDTO[] }>()
);

export const startTestEngine = createAction(
  '[TestEngine] Start',
  props<{ appId: number; create: TestEngineCreateDTO }>()
);
export const startTestEngineSuccess = createAction(
  '[TestEngine] Start Success',
  props<{ engine: TestRunDTO }>()
);
export const startTestEngineFailure = createAction(
  '[TestEngine] Start Failure',
  props<{ error: any }>()
);

export const stopTestEngine = createAction(
  '[TestEngine] Stop',
  props<{ appId: number; id: number }>()
);
export const stopTestEngineSuccess = createAction(
  '[TestEngine] Stop Success',
  props<{ engine: TestRunDTO }>()
);

// The stream is only open while an engine of the app starts or runs
export const startTestEngineStream = createAction(
  '[TestEngine] Start Stream',
  props<{ appId: number }>()
);
export const stopTestEngineStream = createAction(
  '[TestEngine] Stop Stream'
);
export const testEngineStreamMessage = createAction(
  '[TestEngine] Stream Message',
  props<{ engine: TestRunDTO }>()
);
export const testEngineStreamError = createAction(
  '[TestEngine] Stream Error',
  props<{ error: any }>()
);
