import {createSelector} from '@ngrx/store';
import {dataAnalysisFeature, dataAnalysisKeyOf} from './data-analysis.reducer';

export const {
  selectDataAnalysisState,
} = dataAnalysisFeature;


export const selectResultAnalysis = createSelector(
  selectDataAnalysisState,
  (s) => s.resultAnalysis
);

export const selectKey = (dataAnalysisId: number, fileId: number) =>
  dataAnalysisKeyOf(dataAnalysisId, fileId);

export const selectResultAnalysisItem = (dataAnalysisId: number, fileId: number) =>
  createSelector(selectResultAnalysis, (entities) => entities[selectKey(dataAnalysisId, fileId)]);


export const selectAllDataAnalyses = createSelector(
  selectDataAnalysisState,
  state => state.dataAnalyses
);

export const selectSelectedDataAnalysis = createSelector(
  selectDataAnalysisState,
  state => state.selectedAnalysis
);

export const selectLoading = createSelector(
  selectDataAnalysisState,
  state => state.globalLoading
);
export const selectLoaded = createSelector(
  selectDataAnalysisState,
  state => state.globalLoaded
);

export const selectError = createSelector(
  selectDataAnalysisState,
  state => state.globalError
);

export const selectSelectedTool = createSelector(
  selectDataAnalysisState,
  state => state.selectedAnalysis?.selectedTool
);
export const selectSelectedToolHyperParams = createSelector(
  selectDataAnalysisState,
  state => state.selectedAnalysis?.selectedToolHyperParams
);
export const selectActiveTool = createSelector(
  selectDataAnalysisState,
  state => state.selectedAnalysis?.activeTool
);
export const selectActiveToolHyperParams = createSelector(
  selectDataAnalysisState,
  state => state.selectedAnalysis?.activeToolHyperParams
);


export const selectSelectedDataAnalysisWorkflow = createSelector(
  selectDataAnalysisState,
  state => state.selectedAnalysis?.selectedWorkflowDetail
);


export const selectChatConnected = createSelector(selectDataAnalysisState,
  state => state.selectedAnalysis?.chatConnected ?? false
);
export const selectChatError = createSelector(selectDataAnalysisState,
  state => state.selectedAnalysis?.chatError
);


//Files
export const selectDataAnalysisAllFiles = createSelector(
  selectDataAnalysisState,
  state => state.file.files,
);

export const selectDataAnalysisFilesByAnalysis = (dataAnalysisId: number) => createSelector(
  selectDataAnalysisAllFiles,
  files => files.filter(f => f.dataAnalysisId === dataAnalysisId)
);

export const selectDataAnalysisFilesForSelectedWorkflow = createSelector(
  selectDataAnalysisState,
  selectDataAnalysisAllFiles,
  (dataAnalysisState, allFiles) =>
    dataAnalysisState
      ? allFiles.filter(f => f.dataAnalysisId === dataAnalysisState?.selectedAnalysis?.id)
      : []
);

export const selectDataAnalysisAllCurrentUploads = createSelector(
  selectDataAnalysisState,
  state => state.file.currentUpload
);

export const selectDataAnalysisCurrentUploadByWorkflow = (workflowId?: number) => createSelector(
  selectDataAnalysisState,
  state => {
    if (workflowId) {
      return state.file.currentUpload[workflowId] || {progress: 0, inProgress: false};
    }
    return {progress: 0, inProgress: false};
  }
);

export const selectDataAnalysisCurrentUploadForCurrentWorkflow = createSelector(
  selectDataAnalysisState,
  (dataAnalysisState) =>
    dataAnalysisState?.selectedAnalysis?.id
      ? dataAnalysisState.file.currentUpload[dataAnalysisState.selectedAnalysis.id] || {progress: 0, inProgress: false}
      : {progress: 0, inProgress: false}
);


export const selectDataAnalysisCurrentUploadByFileId = (fileId?: number) => createSelector(
  selectDataAnalysisState,
  state => {
    if (fileId) {
      return state.file.currentUpload[fileId] || {progress: 0, inProgress: false};
    }
    return {progress: 0, inProgress: false};
  }
);


export const selectDataAnalysisFileLoading = createSelector(
  selectDataAnalysisState,
  state => state.file.loading
);

export const selectDataAnalysisFileError = createSelector(
  selectDataAnalysisState,
  state => state.file.error
);

export const selectDataAnalysisAllFileContents = createSelector(
  selectDataAnalysisState,
  state => state.file.fileContents
);

export const selectExecutionExecutionState = createSelector(
  selectDataAnalysisState,
  state => state.execution
);


export const selectExecutionRunPredictions = createSelector(
  selectExecutionExecutionState,
  execution => execution.predictions
);

export const selectExecutionLastRunPrediction = createSelector(
  selectExecutionExecutionState,
  execution => execution.lastPrediction
);

export const selectExecutionLastRunPredictionForWorkflow = (workflowId?: number) =>
  createSelector(
    selectExecutionExecutionState,
    execution => {
      if (!workflowId) {
        return execution.lastPrediction;
      }

      if (
        execution.lastPrediction &&
        execution.lastPrediction.dataAnalysisId === workflowId
      ) {
        return execution.lastPrediction;
      }

      const matchingPredictions = execution.predictions.filter(
        (prediction) => prediction.dataAnalysisId === workflowId
      );

      if (!matchingPredictions.length) {
        return null;
      }

      const runningPrediction = [...matchingPredictions].reverse().find((prediction) => {
        const status = String(prediction.status ?? '').toUpperCase();
        return status !== 'FINISHED' && status !== 'STOPPED' && status !== 'ERROR';
      });

      if (runningPrediction) {
        return runningPrediction;
      }

      return [...matchingPredictions].reverse()[0] ?? null;
    }
  );

export const selectExecutionRunRunning = createSelector(
  selectExecutionExecutionState,
  execution => execution.running
);

export const selectExecutionRunError = createSelector(
  selectExecutionExecutionState,
  execution => execution.error
);
