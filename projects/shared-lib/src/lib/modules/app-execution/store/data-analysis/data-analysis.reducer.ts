import {createFeature, createReducer, on} from "@ngrx/store";
import {DataAnalysisActions} from "@shared-lib/modules/app-execution/store/data-analysis/data-analysis.actions";
import {
  getExecutionPredictionKey,
  getInitialDataAnalysisState,
  patchSelectedAnalysisState,
  removeRunFromExecution,
  removeRunFromSelectedAnalysis,
  upsertResultAnalysisEntity,
  upsertSelectedAnalysisMessage
} from "@shared-lib/modules/app-execution/store/data-analysis/data-analysis-reducer.helper";
import {
  ResultAnalysisItemKey,
  ResultAnalysisItemState,
  SelectedDataAnalysisState
} from "@shared-lib/modules/app-execution/model/data-analyzer";
import {ModelWorkflowDTO} from "@shared-lib/modules/app-execution/dto/model-workflow";
import {ModelWorkflowChatMessageType} from "@shared-lib/modules/app-execution/dto/model-workflow-chat";
import {DataAnalysisFileDTO} from "@shared-lib/modules/app-execution/dto/model-workflow-file";
import {ModelWorkflowUploadFileResponse} from "@shared-lib/modules/app-execution/model/model-workflow-file";
import {FileContentDTO} from "@shared-lib/modules/files/dto/file";
import {DataAnalysisPredictionDTO} from "@shared-lib/modules/app-execution/dto/prediction";

export const featureKey = 'DataAnalysis';


export const dataAnalysisKeyOf = (dataAnalysisId: number, fileId: number): ResultAnalysisItemKey =>
  `${dataAnalysisId}:${fileId}`;

export interface DataAnalysisFileState {
  //files
  files: DataAnalysisFileDTO[];
  currentUpload: { [fileId: number]: ModelWorkflowUploadFileResponse };
  fileContents: { [fileId: number]: FileContentDTO };
  errorByFileId: { [fileId: number]: any };
  error: string | null;
  loading: boolean;
  loaded: boolean;
}


export interface ExecutionState {
  predictions: DataAnalysisPredictionDTO[];
  lastPrediction: DataAnalysisPredictionDTO | null;
  running: boolean;
  error: any;
}

export interface DataAnalysisState {
  resultAnalysis: Record<ResultAnalysisItemKey, ResultAnalysisItemState>;
  dataAnalyses: ModelWorkflowDTO[];
  selectedAnalysis: SelectedDataAnalysisState | null;

  //files
  file: DataAnalysisFileState;

  //predictions
  execution: ExecutionState;

  //global
  globalError: string | null;
  globalLoading: boolean;
  globalLoaded: boolean;
}

const initialState: DataAnalysisState = {
  resultAnalysis: {},
  dataAnalyses: [],
  selectedAnalysis: null,
  file: {
    files: [],
    currentUpload: {},
    fileContents: {},
    errorByFileId: {},
    error: null,
    loaded: false,
    loading: false,
  },
  execution: {
    predictions: [],
    lastPrediction: null,
    running: false,
    error: null,
  },
  globalError: null,
  globalLoaded: false,
  globalLoading: false,
};

export const dataAnalysisFeature = createFeature({
  name: featureKey,
  reducer: createReducer(
    initialState,
    on(DataAnalysisActions.error, (state, {error}): DataAnalysisState => ({
        ...state,
        globalError: error
      })
    ),

    /************************************
     *       Data Analyses CRUD         *
     ************************************/
    on(DataAnalysisActions.loadDataAnalyses, (state): DataAnalysisState => ({
      ...state,
      globalLoaded: false,
      globalLoading: true,
      globalError: null
    })),
    on(DataAnalysisActions.loadDataAnalysesSuccess, (state, {workflows}): DataAnalysisState => ({
      ...state,
      dataAnalyses: workflows,
      globalLoaded: true,
      globalLoading: false,
      globalError: null
    })),
    on(DataAnalysisActions.loadDataAnalysesFailure, (state, {error}): DataAnalysisState => ({
      ...state,
      globalLoaded: true,
      globalLoading: false,
      globalError: error
    })),

    on(DataAnalysisActions.loadDataAnalysis, (state, {id}): DataAnalysisState => ({
      ...state,
      selectedAnalysis: getInitialDataAnalysisState(id)
    })),
    on(DataAnalysisActions.loadDataAnalysisSuccess, (state, {id, dataAnalysis}): DataAnalysisState => {
      const baseState = state.selectedAnalysis || getInitialDataAnalysisState(id);
      return {
        ...state,
        selectedAnalysis: {
          ...baseState,
          detail: dataAnalysis,
          loaded: true,
          loading: false,
        }
      };
    }),
    on(DataAnalysisActions.loadDataAnalysisFailure, (state, {id, error}): DataAnalysisState => {
      const baseState = state.selectedAnalysis || getInitialDataAnalysisState(id);
      return {
        ...state,
        selectedAnalysis: {
          ...baseState,
          error: error,
          loaded: true,
          loading: false,
        }
      };
    }),
    on(DataAnalysisActions.loadDataAnalysisWorkflowRun, (state, {id}): DataAnalysisState => ({
      ...state,
      selectedAnalysis: state.selectedAnalysis?.id === id ? state.selectedAnalysis : getInitialDataAnalysisState(id)
    })),
    on(DataAnalysisActions.loadDataAnalysisWorkflowRunSuccess, (state, {id, workflow}): DataAnalysisState => {
      const baseState = state.selectedAnalysis?.id === id ? state.selectedAnalysis : getInitialDataAnalysisState(id);
      return {
        ...state,
        selectedAnalysis: {
          ...baseState,
          selectedWorkflowDetail: workflow,
          loaded: true,
          loading: false,
        }
      };
    }),
    on(DataAnalysisActions.loadDataAnalysisWorkflowRunFailure, (state, {id, error}): DataAnalysisState => {
      const baseState = state.selectedAnalysis?.id === id ? state.selectedAnalysis : getInitialDataAnalysisState(id);
      return {
        ...state,
        selectedAnalysis: {
          ...baseState,
          error: error,
          loaded: true,
          loading: false,
        }
      };
    }),
    on(DataAnalysisActions.createDataAnalysis, (state): DataAnalysisState => ({
      ...state,
      globalLoaded: false,
      globalLoading: true,
      globalError: null
    })),
    on(DataAnalysisActions.createDataAnalysisSuccess, (state, {workflow}): DataAnalysisState => ({
      ...state,
      dataAnalyses: [...state.dataAnalyses, workflow],
      globalLoaded: true,
      globalLoading: false,
      globalError: null
    })),
    on(DataAnalysisActions.createDataAnalysisFailure, (state, {error}): DataAnalysisState => ({
      ...state,
      globalLoaded: true,
      globalLoading: false,
      globalError: error
    })),

    on(DataAnalysisActions.deleteDataAnalysis, (state): DataAnalysisState => ({
      ...state,
      globalLoaded: false,
      globalLoading: true,
      globalError: null
    })),
    on(DataAnalysisActions.deleteDataAnalysisSuccess, (state, {id}): DataAnalysisState => ({
      ...state,
      dataAnalyses: state.dataAnalyses.filter(w => w.id !== id),
      selectedAnalysis: state.selectedAnalysis?.id === id ? null : state.selectedAnalysis,
      globalLoaded: true,
      globalLoading: false,
      globalError: null
    })),
    on(DataAnalysisActions.deleteDataAnalysisFailure, (state, {error}): DataAnalysisState => ({
      ...state,
      globalLoaded: true,
      globalLoading: false,
      globalError: error
    })),

    /************************************
     *       Delete Runs                 *
     ************************************/
    on(DataAnalysisActions.deleteWorkflowRun, (state, {dataAnalysisId}): DataAnalysisState =>
      patchSelectedAnalysisState(state, dataAnalysisId, {
        loading: true,
        loaded: false,
        error: null,
      })
    ),
    on(DataAnalysisActions.deleteWorkflowRunSuccess, (state, {dataAnalysisId, workflowId, id}): DataAnalysisState =>
      patchSelectedAnalysisState(
        removeRunFromSelectedAnalysis(state, dataAnalysisId, id, workflowId),
        dataAnalysisId,
        {
          loading: false,
          loaded: true,
          error: null,
        }
      )
    ),
    on(DataAnalysisActions.deleteWorkflowRunFailure, (state, {dataAnalysisId, error}): DataAnalysisState =>
      patchSelectedAnalysisState(state, dataAnalysisId, {
        loading: false,
        loaded: true,
        error,
      })
    ),

    on(DataAnalysisActions.deleteRun, (state, {dataAnalysisId}): DataAnalysisState =>
      patchSelectedAnalysisState(state, dataAnalysisId, {
        loading: true,
        loaded: false,
        error: null,
      })
    ),
    on(DataAnalysisActions.deleteRunSuccess, (state, {dataAnalysisId, id}): DataAnalysisState => {
      const nextState = removeRunFromExecution(
        removeRunFromSelectedAnalysis(state, dataAnalysisId, id),
        id
      );

      return patchSelectedAnalysisState(nextState, dataAnalysisId, {
        loading: false,
        loaded: true,
        error: null,
      });
    }),
    on(DataAnalysisActions.deleteRunFailure, (state, {dataAnalysisId, error}): DataAnalysisState =>
      patchSelectedAnalysisState(state, dataAnalysisId, {
        loading: false,
        loaded: true,
        error,
      })
    ),
    /************************************
     *       Data analysis other         *
     ************************************/

    on(DataAnalysisActions.selectStoreElement, (state, {storeElement, hyperParams}): DataAnalysisState => ({
      ...state,
      selectedAnalysis: state.selectedAnalysis ? {
        ...state.selectedAnalysis,
        selectedTool: storeElement,
        selectedToolHyperParams: hyperParams
      } : null,
    })),
    on(DataAnalysisActions.setActiveStoreElement, (state, {storeElement, hyperParams}): DataAnalysisState => ({
      ...state,
      selectedAnalysis: state.selectedAnalysis ? {
        ...state.selectedAnalysis,
        activeTool: storeElement,
        activeToolHyperParams: hyperParams
      } : null,
    })),
    on(DataAnalysisActions.unselectStoreElement, (state,): DataAnalysisState => ({
      ...state,
      selectedAnalysis: state.selectedAnalysis ? {
        ...state.selectedAnalysis,
        selectedTool: null,
        selectedToolHyperParams: null
      } : null,
    })),
    on(DataAnalysisActions.addExperimentResults, (state, {prediction}): DataAnalysisState => {
      const selected = state.selectedAnalysis;
      if (!selected?.detail) return state;
      const isWorkflow = prediction.workflowId != null;
      const wrapper = {
        type: isWorkflow ? ModelWorkflowChatMessageType.WORKFLOW_PREDICTION : ModelWorkflowChatMessageType.PREDICTION,
        message: prediction,
      };

      return upsertSelectedAnalysisMessage(state, selected.id, wrapper);
    }),
    on(DataAnalysisActions.addDataAnalysisMessage, (state, {wrapper}): DataAnalysisState => {
      const selected = state.selectedAnalysis;
      if (!selected?.detail) return state;

      return upsertSelectedAnalysisMessage(state, selected.id, wrapper);
    }),
    /************************************
     *       Data analysis chat         *
     ************************************/
    on(DataAnalysisActions.chatSocketOpened, (state): DataAnalysisState => {
      const baseState = state.selectedAnalysis;
      if (!baseState) return state;
      return {
        ...state,
        selectedAnalysis: {
          ...baseState,
          chatConnected: true,
          chatError: undefined
        }
      };
    }),
    on(DataAnalysisActions.chatSocketClosed, (state): DataAnalysisState => {
      const baseState = state.selectedAnalysis;
      if (!baseState) return state;
      return {
        ...state,
        selectedAnalysis: {
          ...baseState,
          chatConnected: false,
          chatError: undefined
        }
      };
    }),
    on(DataAnalysisActions.chatSocketError, (state, {error}): DataAnalysisState => {
      const baseState = state.selectedAnalysis;
      if (!baseState) return state;
      return {
        ...state,
        selectedAnalysis: {
          ...baseState,
          chatConnected: false,
          chatError: error
        }
      };
    }),
    /************************************
     *       AnalyzeResult         *
     ************************************/
    on(DataAnalysisActions.analyzeResult, (state, {dataAnalysisId, fileId}): DataAnalysisState =>
      upsertResultAnalysisEntity(state, dataAnalysisId, fileId, {
        loading: true,
        loaded: false,
        error: null,
        result: {
          result: ""
        }
      })
    ),
    on(DataAnalysisActions.analyzeResultChunk, (state, {dataAnalysisId, fileId, result}): DataAnalysisState => {
      return upsertResultAnalysisEntity(state, dataAnalysisId, fileId, {
        appendText: result.result,
      });
    }),
    on(DataAnalysisActions.analyzeResultSuccess, (state, {dataAnalysisId, fileId}): DataAnalysisState => {
      return upsertResultAnalysisEntity(state, dataAnalysisId, fileId, {
        loading: false,
        loaded: true,
        error: null,
      });
    }),
    on(DataAnalysisActions.analyzeResultFailure, (state: DataAnalysisState, {
        dataAnalysisId,
        fileId,
        error
      }): DataAnalysisState => {
        return upsertResultAnalysisEntity(state, dataAnalysisId, fileId, {
          loading: false,
          loaded: true,
          error: error
        });
      }
    ),
    /************************************
     *       File management         *
     ************************************/
    on(DataAnalysisActions.loadFiles, (state): DataAnalysisState => ({
      ...state,
      file: {
        ...state.file,
        loading: true,
        loaded: false,
        error: null
      }
    })),
    on(DataAnalysisActions.loadFilesSuccess, (state, {files}): DataAnalysisState => ({
      ...state,
      file: {
        ...state.file,
        files: files,
        loading: false,
        loaded: true,
        error: null
      }
    })),
    on(DataAnalysisActions.loadFilesFailure, (state, {error}): DataAnalysisState => ({
      ...state,
      file: {
        ...state.file,
        loading: false,
        loaded: false,
        error
      }
    })),
    on(DataAnalysisActions.uploadFile, (state, {dataAnalysisId}): DataAnalysisState => ({
      ...state,
      file: {
        ...state.file,
        currentUpload: {
          ...state.file.currentUpload,
          [dataAnalysisId]: {progress: 0, inProgress: true},
        },
        error: null,
      },
    })),
    on(DataAnalysisActions.uploadFileProgress, (state, {dataAnalysisId, response}): DataAnalysisState => ({
      ...state,
      file: {
        ...state.file,
        currentUpload: {
          ...state.file.currentUpload,
          [dataAnalysisId]: response,
        },
      },
    })),
    on(DataAnalysisActions.uploadFileSuccess, (state, {dataAnalysisId, response}): DataAnalysisState => ({
      ...state,
      file: {
        ...state.file,
        files: response.result ? [...state.file.files, response.result] : state.file.files,
        currentUpload: {
          ...state.file.currentUpload,
          [dataAnalysisId]: response,
        },
        error: null,
      },
    })),
    on(DataAnalysisActions.uploadFileFailure, (state, {error}): DataAnalysisState => ({
      ...state,
      file: {
        ...state.file,
        error,
      },
    })),

    on(DataAnalysisActions.uploadFileWithFileId, (state, {fileId}): DataAnalysisState => ({
      ...state,
      file: {
        ...state.file,
        currentUpload: {
          ...state.file.currentUpload,
          [fileId]: {progress: 0, inProgress: true},
        },
        errorByFileId: {
          ...state.file.errorByFileId,
          [fileId]: null,
        },
      },
    })),
    on(DataAnalysisActions.uploadFileProgressWithFileId, (state, {response, fileId}): DataAnalysisState => ({
      ...state,
      file: {
        ...state.file,
        currentUpload: {
          ...state.file.currentUpload,
          [fileId]: response,
        },
      },
    })),
    on(DataAnalysisActions.uploadFileSuccessWithFileId, (state, {response, fileId}): DataAnalysisState => ({
      ...state,
      file: {
        ...state.file,
        files: response.result ? [...state.file.files, response.result] : state.file.files,
        currentUpload: {
          ...state.file.currentUpload,
          [fileId]: response,
        },
        errorByFileId: {
          ...state.file.errorByFileId,
          [fileId]: null,
        },
      },
    })),
    on(DataAnalysisActions.uploadFileFailureWithFileId, (state, {error, fileId}): DataAnalysisState => ({
      ...state,
      file: {
        ...state.file,
        errorByFileId: {
          ...state.file.errorByFileId,
          [fileId]: error,
        },
      },
    })),

    on(DataAnalysisActions.deleteFileSuccess, (state, {fileId}): DataAnalysisState => ({
      ...state,
      file: {
        ...state.file,
        files: state.file.files.filter(f => f.id !== fileId),
      },
    })),
    on(DataAnalysisActions.deleteFileFailure, (state, {error}): DataAnalysisState => ({
      ...state,
      file: {
        ...state.file,
        error,
      },
    })),
    /************************************
     *       execution                   *
     ************************************/
    on(DataAnalysisActions.startWorkflowRun, (state): DataAnalysisState => ({
      ...state,
      selectedAnalysis: state.selectedAnalysis ? {
        ...state.selectedAnalysis,
        activeTool: state.selectedAnalysis.activeTool ?? state.selectedAnalysis.selectedTool,
        activeToolHyperParams: state.selectedAnalysis.activeToolHyperParams ?? state.selectedAnalysis.selectedToolHyperParams,
        selectedTool: null,
        selectedToolHyperParams: null,
      } : null,
      execution: {
        ...state.execution,
        running: true,
        lastPrediction: null,
        error: null,
      }
    })),
    on(DataAnalysisActions.startRun, (state): DataAnalysisState => ({
      ...state,
      selectedAnalysis: state.selectedAnalysis ? {
        ...state.selectedAnalysis,
        activeTool: state.selectedAnalysis.activeTool ?? state.selectedAnalysis.selectedTool,
        activeToolHyperParams: state.selectedAnalysis.activeToolHyperParams ?? state.selectedAnalysis.selectedToolHyperParams,
        selectedTool: null,
        selectedToolHyperParams: null,
      } : null,
      execution: {
        ...state.execution,
        running: true,
        lastPrediction: null,
        error: null,
      }
    })),

    on(DataAnalysisActions.runProgress, (state, {prediction}): DataAnalysisState => {
      const predictionKey = getExecutionPredictionKey(prediction);
      const idx = predictionKey == null
        ? -1
        : state.execution.predictions.findIndex((p) => getExecutionPredictionKey(p) === predictionKey);

      const nextPredictions = idx >= 0
        ? [...state.execution.predictions.slice(0, idx), prediction, ...state.execution.predictions.slice(idx + 1)]
        : [...state.execution.predictions, prediction];
      return {
        ...state,
        execution: {
          ...state.execution,
          predictions: nextPredictions,
          lastPrediction: prediction,
        }
      };
    }),
    on(DataAnalysisActions.runError, (state, {error}): DataAnalysisState => ({
      ...state,
      execution: {
        ...state.execution,
        running: false,
        error
      }
    })),

    on(DataAnalysisActions.runComplete, (state): DataAnalysisState => ({
      ...state,
      selectedAnalysis: state.selectedAnalysis ? {
        ...state.selectedAnalysis,
        activeTool: null,
        activeToolHyperParams: null,
      } : null,
      execution: {
        ...state.execution,
        running: false,
        lastPrediction: null,
      }
    })),
    on(DataAnalysisActions.addExperimentResults, (state): DataAnalysisState => ({
      ...state,
      execution: {
        ...state.execution,
        error: null,
      }
    })),
    on(DataAnalysisActions.startRunUpdates, (state, {prediction}): DataAnalysisState => {
      const predictionKey = getExecutionPredictionKey(prediction);
      const idx = predictionKey == null
        ? -1
        : state.execution.predictions.findIndex((p) => getExecutionPredictionKey(p) === predictionKey);

      const nextPredictions =
        predictionKey == null
          ? state.execution.predictions
          : (idx >= 0
            ? [...state.execution.predictions.slice(0, idx), prediction, ...state.execution.predictions.slice(idx + 1)]
            : [...state.execution.predictions, prediction]);

      const isFinished = String((prediction as any)?.status ?? '').toUpperCase() === 'FINISHED';

      return {
        ...state,
        execution: {
          ...state.execution,
          running: !isFinished,
          error: null,
          lastPrediction: prediction,
          predictions: nextPredictions,
        }
      };
    }),
    on(DataAnalysisActions.startWorkflowRunUpdates, (state, {prediction}): DataAnalysisState => {
      const predictionKey = getExecutionPredictionKey(prediction);
      const idx = predictionKey == null
        ? -1
        : state.execution.predictions.findIndex((p) => getExecutionPredictionKey(p) === predictionKey);
      const nextPredictions = predictionKey == null
        ? state.execution.predictions
        : (idx >= 0
          ? [...state.execution.predictions.slice(0, idx), prediction, ...state.execution.predictions.slice(idx + 1)]
          : [...state.execution.predictions, prediction]);

      return {
        ...state,
        execution: {
          ...state.execution,
          running: true,
          error: null,
          lastPrediction: prediction,
          predictions: nextPredictions,
        }
      };
    }),
  )
});
