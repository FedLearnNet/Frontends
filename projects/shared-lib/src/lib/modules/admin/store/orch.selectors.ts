import {createFeatureSelector, createSelector} from '@ngrx/store';
import {featureKey, OrchState} from './orch.reducer';

export const selectOrchState = createFeatureSelector<OrchState>(featureKey);

export const selectDockerInfo = createSelector(selectOrchState, (state) => state.dockerInfo);
export const selectRunningContainers = createSelector(selectOrchState, (state) => state.runningContainers);
export const selectSelectedRunningContainer = createSelector(
  selectOrchState,
  (state) => state.selectedRunningContainer
);
export const selectRunningContainerById = (id: string) =>
  createSelector(selectRunningContainers, (containers) => containers.find((container) => container.Id === id) ?? null);
export const selectRunningLogs = createSelector(selectOrchState, (state) => state.runningLogs);
export const selectRunningLogsContainerId = createSelector(selectOrchState, (state) => state.runningLogsContainerId);
export const selectRuns = createSelector(selectOrchState, (state) => state.runs);
export const selectSelectedRun = createSelector(selectOrchState, (state) => state.selectedRun);
export const selectRunById = (id: number) =>
  createSelector(selectRuns, (runs) => runs.find((run) => run.id === id) ?? null);
export const selectRunLogsByRunId = (id: number) =>
  createSelector(selectOrchState, (state) => state.runLogsByRunId[id] ?? []);
export const selectVolumes = createSelector(selectOrchState, (state) => state.volumes);
export const selectSelectedVolume = createSelector(selectOrchState, (state) => state.selectedVolume);
export const selectVolumeByName = (name: string) =>
  createSelector(selectVolumes, (volumes) => volumes.find((volume) => volume.name === name) ?? null);

export const selectOrchLoading = createSelector(selectOrchState, (state) => state.loading);
export const selectDockerInfoLoading = createSelector(selectOrchState, (state) => state.dockerInfoLoading);
export const selectRunningContainersLoading = createSelector(
  selectOrchState,
  (state) => state.runningContainersLoading
);
export const selectRunningContainerLoading = createSelector(
  selectOrchState,
  (state) => state.runningContainerLoading
);
export const selectRunningLogsStreaming = createSelector(selectOrchState, (state) => state.runningLogsStreaming);
export const selectRunsLoading = createSelector(selectOrchState, (state) => state.runsLoading);
export const selectRunLoading = createSelector(selectOrchState, (state) => state.runLoading);
export const selectRunLogsLoading = createSelector(selectOrchState, (state) => state.runLogsLoading);
export const selectVolumesLoading = createSelector(selectOrchState, (state) => state.volumesLoading);
export const selectVolumeLoading = createSelector(selectOrchState, (state) => state.volumeLoading);
export const selectFcContainers = createSelector(selectOrchState, (state) => state.fcContainers);
export const selectFcContainersLoading = createSelector(selectOrchState, (state) => state.fcContainersLoading);
export const selectFcContainersCleaning = createSelector(selectOrchState, (state) => state.fcContainersCleaning);
export const selectVolumeRemoving = createSelector(selectOrchState, (state) => state.volumeRemoving);
export const selectOrchError = createSelector(selectOrchState, (state) => state.error);
