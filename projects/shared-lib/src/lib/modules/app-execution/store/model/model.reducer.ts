import {createReducer, on} from '@ngrx/store';
import * as ModelActions from './model.actions';
import {ModelDetailDto, ModelDto, ModelSubDto, ModelVersionDto} from "@shared-lib/modules/app-execution/dto/model";
import {DataAnalysisActions} from "@shared-lib/modules/app-execution/store/data-analysis/data-analysis.actions";

export interface ModelState {
  models: ModelDto[];
  myModels: ModelDto[];
  detail: ModelDetailDto | null;
  subModelForRun: ModelSubDto | null;
  modelVersionForExperiment: ModelVersionDto | null;
  selectedSubModel: ModelSubDto | null;
  loading: boolean;
  error: any;
}

export const initialModelState: ModelState = {
  models: [],
  myModels: [],
  detail: null,
  subModelForRun: null,
  modelVersionForExperiment: null,
  selectedSubModel: null,
  loading: false,
  error: null,
};

export const featureKey = 'model';


export const modelReducer = createReducer(
    initialModelState,
    on(ModelActions.loadModels, ModelActions.loadMyModels, (state): ModelState => ({
      ...state,
      loading: true,
      error: null
    })),
    on(ModelActions.loadModelsSuccess, (state, {models}): ModelState => ({...state, models, loading: false})),
    on(ModelActions.loadMyModelsSuccess, (state, {models}): ModelState => ({...state, myModels: models, loading: false})),
    on(ModelActions.loadModelsFailure, ModelActions.loadMyModelsFailure, (state, {error}): ModelState => ({
      ...state,
      loading: false,
      error
    })),

    on(ModelActions.loadModelDetail, (state): ModelState => ({...state, loading: true, error: null})),
    on(ModelActions.unselectModelDetail, (state): ModelState => ({...state, detail: null, error: null})),
    on(ModelActions.loadModelDetailSuccess, (state, {detail}): ModelState => ({...state, detail, loading: false})),
    on(ModelActions.loadModelDetailFailure, (state, {error}): ModelState => ({...state, loading: false, error})),
    on(ModelActions.versionChanged, (state, {version}): ModelState => (
      state.detail ? {
        ...state,
        detail: {
          ...state.detail,
          lastVersion: version
        }
      } : state
    )),
    on(ModelActions.loadSubModelForRun, (state): ModelState => ({...state, loading: true, error: null})),
    on(ModelActions.loadSubModelForRunSuccess, (state, {sub}): ModelState => ({
      ...state,
      subModelForRun: sub,
      loading: false
    })),
    on(ModelActions.loadSubModelForRunFailure, (state, {error}): ModelState => ({...state, loading: false, error})),

    on(ModelActions.loadModelVersionForExperiment, (state): ModelState => ({...state, loading: true, error: null})),
    on(ModelActions.loadModelVersionForExperimentSuccess, (state, {version}): ModelState => ({
      ...state,
      modelVersionForExperiment: version,
      loading: false
    })),
    on(ModelActions.loadModelVersionForExperimentFailure, (state, {error}): ModelState => ({
      ...state,
      loading: false,
      error
    })),

    on(ModelActions.selectSubModel, (state): ModelState => ({...state, loading: true, error: null})),
    on(ModelActions.selectSubModelSuccess, (state, {selected}): ModelState => ({
      ...state,
      selectedSubModel: selected,
      loading: false
    })),
    on(ModelActions.selectSubModelFailure, (state, {error}): ModelState => ({...state, loading: false, error})),
    on(DataAnalysisActions.addExperimentResults, (state): ModelState => ({
      ...state,
      detail: null,
    })),
    on(ModelActions.updateModel, (state): ModelState => ({
      ...state,
      loading: true,
      error: null,
    })),
    on(ModelActions.updateModelSuccess, (state, {model}): ModelState => ({
      ...state,
      loading: false,
      models: state.models.map(m => (m.id === model.id ? {...m, ...model} : m)),
      myModels: state.myModels.map(m => (m.id === model.id ? {...m, ...model} : m)),
      detail:
        state.detail && state.detail.id === model.id
          ? ({...state.detail, ...model} as ModelDetailDto)
          : state.detail,
    })),
    on(ModelActions.updateModelFailure, (state, {error}): ModelState => ({
      ...state,
      loading: false,
      error,
    })),
    on(ModelActions.updateModelVersion, (state): ModelState => ({
      ...state,
      loading: true,
      error: null,
    })),
    on(ModelActions.updateModelVersionSuccess, (state, {version}): ModelState => ({
      ...state,
      loading: false,
      modelVersionForExperiment:
        state.modelVersionForExperiment && state.modelVersionForExperiment.id === version.id
          ? version
          : state.modelVersionForExperiment,
      detail: state.detail
        ? {
          ...state.detail,
          lastVersion:
            state.detail.lastVersion && state.detail.lastVersion.id === version.id
              ? version
              : state.detail.lastVersion,
        }
        : state.detail,
    })),
    on(ModelActions.updateModelVersionFailure, (state, {error}): ModelState => ({
      ...state,
      loading: false,
      error,
    })),
  )
;
