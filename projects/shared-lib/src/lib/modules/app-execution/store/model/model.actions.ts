import {createAction, props} from '@ngrx/store';
import {ModelDetailDto, ModelDto, ModelSubDto, ModelVersionDto} from "@shared-lib/modules/app-execution/dto/model";

// Load all dto
export const loadModels = createAction('[Model] Load Models');
export const loadModelsSuccess = createAction(
  '[Model] Load Models Success',
  props<{ models: ModelDto[] }>()
);
export const loadModelsFailure = createAction(
  '[Model] Load Models Failure',
  props<{ error: any }>()
);

// Load my dto (optional appId)
export const loadMyModels = createAction(
  '[Model] Load My Models',
  props<{
    appId?: number
    experimentId?: number
    federatedExperimentId?: number
  }>()
);
export const loadMyModelsSuccess = createAction(
  '[Model] Load My Models Success',
  props<{ models: ModelDto[] }>()
);
export const loadMyModelsFailure = createAction(
  '[Model] Load My Models Failure',
  props<{ error: any }>()
);

// Load detail
export const loadModelDetail = createAction(
  '[Model] Load Model Detail',
  props<{ id: number }>()
);
export const loadModelDetailSuccess = createAction(
  '[Model] Load Model Detail Success',
  props<{ detail: ModelDetailDto }>()
);
export const loadModelDetailFailure = createAction(
  '[Model] Load Model Detail Failure',
  props<{ error: any }>()
);
export const versionChanged = createAction(
  '[Model] Version Changed',
  props<{ version: ModelVersionDto }>()
);

// Load submodel for run
export const loadSubModelForRun = createAction(
  '[Model] Load SubModel For Run',
  props<{ runId: number }>()
);
export const loadSubModelForRunSuccess = createAction(
  '[Model] Load SubModel For Run Success',
  props<{ sub: ModelSubDto }>()
);
export const loadSubModelForRunFailure = createAction(
  '[Model] Load SubModel For Run Failure',
  props<{ error: any }>()
);

// Load submodel for experiment
export const loadModelVersionForExperiment = createAction(
  '[Model] Load SubModel For Experiment',
  props<{ experimentId?: number,
    federatedExperimentId?: number }>()
);
export const loadModelVersionForExperimentSuccess = createAction(
  '[Model] Load SubModel For Experiment Success',
  props<{ version: ModelVersionDto }>()
);
export const loadModelVersionForExperimentFailure = createAction(
  '[Model] Load SubModel For Experiment Failure',
  props<{ error: any }>()
);

// Select submodel
export const selectSubModel = createAction(
  '[Model] Select SubModel',
  props<{ subModelId: number }>()
);
export const selectSubModelSuccess = createAction(
  '[Model] Select SubModel Success',
  props<{ selected: ModelSubDto }>()
);
export const selectSubModelFailure = createAction(
  '[Model] Select SubModel Failure',
  props<{ error: any }>()
);

export const unselectModelDetail = createAction(
  '[Model] Unselect Detail',
);


/** Update model */
export const updateModel = createAction(
  '[Model] Update Model',
  props<{ id: number; dto: ModelDto }>()
);
export const updateModelSuccess = createAction(
  '[Model] Update Model Success',
  props<{ model: ModelDto }>()
);
export const updateModelFailure = createAction(
  '[Model] Update Model Failure',
  props<{ error: any }>()
);

/** Update model version */
export const updateModelVersion = createAction(
  '[Model] Update Model Version',
  props<{ id: number; modelVersionId: number; dto: ModelVersionDto }>()
);
export const updateModelVersionSuccess = createAction(
  '[Model] Update Model Version Success',
  props<{ version: ModelVersionDto }>()
);
export const updateModelVersionFailure = createAction(
  '[Model] Update Model Version Failure',
  props<{ error: any }>()
);
