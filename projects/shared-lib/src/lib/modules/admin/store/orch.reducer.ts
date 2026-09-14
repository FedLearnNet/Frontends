import {createReducer, on} from '@ngrx/store';
import {OrchActions} from './orch.actions';
import {
  ContainerDTO,
  ContainerLogDTO,
  ContainerRunDTO,
  InfoDTO,
  InspectVolumeResponseDTO
} from '@shared-lib/modules/admin/dto/orch';

export const featureKey = 'orch';

export interface OrchState {
  dockerInfo: InfoDTO | null;
  runningContainers: ContainerDTO[];
  selectedRunningContainer: ContainerDTO | null;
  runningLogs: string[];
  runningLogsContainerId: string | null;
  runs: ContainerRunDTO[];
  selectedRun: ContainerRunDTO | null;
  runLogsByRunId: Record<number, ContainerLogDTO[]>;
  volumes: InspectVolumeResponseDTO[];
  selectedVolume: InspectVolumeResponseDTO | null;
  fcContainers: ContainerDTO[];
  loading: boolean;
  dockerInfoLoading: boolean;
  runningContainersLoading: boolean;
  runningContainerLoading: boolean;
  runningLogsStreaming: boolean;
  runsLoading: boolean;
  runLoading: boolean;
  runLogsLoading: boolean;
  volumesLoading: boolean;
  volumeLoading: boolean;
  fcContainersLoading: boolean;
  fcContainersCleaning: boolean;
  volumeRemoving: boolean;
  error: any;
}

export const initialState: OrchState = {
  dockerInfo: null,
  runningContainers: [],
  selectedRunningContainer: null,
  runningLogs: [],
  runningLogsContainerId: null,
  runs: [],
  selectedRun: null,
  runLogsByRunId: {},
  volumes: [],
  selectedVolume: null,
  fcContainers: [],
  loading: false,
  dockerInfoLoading: false,
  runningContainersLoading: false,
  runningContainerLoading: false,
  runningLogsStreaming: false,
  runsLoading: false,
  runLoading: false,
  runLogsLoading: false,
  volumesLoading: false,
  volumeLoading: false,
  fcContainersLoading: false,
  fcContainersCleaning: false,
  volumeRemoving: false,
  error: null,
};

export const orchReducer = createReducer(
  initialState,

  on(OrchActions.resetState, (): OrchState => initialState),

  on(OrchActions.loadDockerInfo, (state): OrchState => ({
    ...state,
    loading: true,
    dockerInfoLoading: true,
    error: null,
  })),
  on(OrchActions.loadDockerInfoSuccess, (state, {info}): OrchState => ({
    ...state,
    dockerInfo: info,
    loading: false,
    dockerInfoLoading: false,
  })),
  on(OrchActions.loadDockerInfoFailure, (state, {error}): OrchState => ({
    ...state,
    loading: false,
    dockerInfoLoading: false,
    error,
  })),

  on(OrchActions.loadRunningContainers, (state): OrchState => ({
    ...state,
    loading: true,
    runningContainersLoading: true,
    error: null,
  })),
  on(OrchActions.loadRunningContainersSuccess, (state, {containers}): OrchState => ({
    ...state,
    runningContainers: containers,
    loading: false,
    runningContainersLoading: false,
  })),
  on(OrchActions.loadRunningContainersFailure, (state, {error}): OrchState => ({
    ...state,
    loading: false,
    runningContainersLoading: false,
    error,
  })),

  on(OrchActions.loadRunningContainer, (state): OrchState => ({
    ...state,
    loading: true,
    runningContainerLoading: true,
    error: null,
    selectedRunningContainer: null,
  })),
  on(OrchActions.loadRunningContainerSuccess, (state, {container}): OrchState => ({
    ...state,
    selectedRunningContainer: container,
    loading: false,
    runningContainerLoading: false,
  })),
  on(OrchActions.loadRunningContainerFailure, (state, {error}): OrchState => ({
    ...state,
    loading: false,
    runningContainerLoading: false,
    error,
  })),

  on(OrchActions.streamRunningLogs, (state, {id}): OrchState => ({
    ...state,
    error: null,
    runningLogs: [],
    runningLogsContainerId: id,
    runningLogsStreaming: true,
  })),
  on(OrchActions.streamRunningLogsMessage, (state, {id, message}): OrchState => {
    if (state.runningLogsContainerId !== id) {
      return state;
    }

    return {
      ...state,
      runningLogs: [...state.runningLogs, message],
    };
  }),
  on(OrchActions.streamRunningLogsComplete, (state, {id}): OrchState => ({
    ...state,
    runningLogsStreaming: state.runningLogsContainerId === id ? false : state.runningLogsStreaming,
  })),
  on(OrchActions.streamRunningLogsFailure, (state, {id, error}): OrchState => ({
    ...state,
    runningLogsStreaming: state.runningLogsContainerId === id ? false : state.runningLogsStreaming,
    error,
  })),
  on(OrchActions.stopRunningLogsStream, (state, {id}): OrchState => ({
    ...state,
    runningLogsStreaming: state.runningLogsContainerId === id ? false : state.runningLogsStreaming,
  })),

  on(OrchActions.loadRuns, (state): OrchState => ({
    ...state,
    loading: true,
    runsLoading: true,
    error: null,
  })),
  on(OrchActions.loadRunsSuccess, (state, {runs}): OrchState => ({
    ...state,
    runs,
    loading: false,
    runsLoading: false,
  })),
  on(OrchActions.loadRunsFailure, (state, {error}): OrchState => ({
    ...state,
    loading: false,
    runsLoading: false,
    error,
  })),

  on(OrchActions.loadRun, (state): OrchState => ({
    ...state,
    loading: true,
    runLoading: true,
    error: null,
    selectedRun: null,
  })),
  on(OrchActions.loadRunSuccess, (state, {run}): OrchState => ({
    ...state,
    selectedRun: run,
    loading: false,
    runLoading: false,
  })),
  on(OrchActions.loadRunFailure, (state, {error}): OrchState => ({
    ...state,
    loading: false,
    runLoading: false,
    error,
  })),

  on(OrchActions.loadRunLogs, (state): OrchState => ({
    ...state,
    loading: true,
    runLogsLoading: true,
    error: null,
  })),
  on(OrchActions.loadRunLogsSuccess, (state, {id, logs}): OrchState => ({
    ...state,
    runLogsByRunId: {...state.runLogsByRunId, [id]: logs},
    loading: false,
    runLogsLoading: false,
  })),
  on(OrchActions.loadRunLogsFailure, (state, {error}): OrchState => ({
    ...state,
    loading: false,
    runLogsLoading: false,
    error,
  })),

  on(OrchActions.loadVolumes, (state): OrchState => ({
    ...state,
    loading: true,
    volumesLoading: true,
    error: null,
  })),
  on(OrchActions.loadVolumesSuccess, (state, {volumes}): OrchState => ({
    ...state,
    volumes,
    loading: false,
    volumesLoading: false,
  })),
  on(OrchActions.loadVolumesFailure, (state, {error}): OrchState => ({
    ...state,
    loading: false,
    volumesLoading: false,
    error,
  })),

  on(OrchActions.loadVolume, (state): OrchState => ({
    ...state,
    loading: true,
    volumeLoading: true,
    error: null,
    selectedVolume: null,
  })),
  on(OrchActions.loadVolumeSuccess, (state, {volume}): OrchState => ({
    ...state,
    selectedVolume: volume,
    loading: false,
    volumeLoading: false,
  })),
  on(OrchActions.loadVolumeFailure, (state, {error}): OrchState => ({
    ...state,
    loading: false,
    volumeLoading: false,
    error,
  })),

  on(OrchActions.removeVolume, (state): OrchState => ({
    ...state,
    volumeRemoving: true,
    error: null,
  })),
  on(OrchActions.removeVolumeSuccess, (state, {name}): OrchState => ({
    ...state,
    volumes: state.volumes.filter(v => ((v as any).name ?? (v as any).Name) !== name),
    volumeRemoving: false,
  })),
  on(OrchActions.removeVolumeFailure, (state, {error}): OrchState => ({
    ...state,
    volumeRemoving: false,
    error,
  })),

  on(OrchActions.loadFcContainers, (state): OrchState => ({
    ...state,
    fcContainersLoading: true,
    error: null,
  })),
  on(OrchActions.loadFcContainersSuccess, (state, {containers}): OrchState => ({
    ...state,
    fcContainers: containers,
    fcContainersLoading: false,
  })),
  on(OrchActions.loadFcContainersFailure, (state, {error}): OrchState => ({
    ...state,
    fcContainersLoading: false,
    error,
  })),

  on(OrchActions.cleanupFcContainers, (state): OrchState => ({
    ...state,
    fcContainersCleaning: true,
    error: null,
  })),
  on(OrchActions.cleanupFcContainersSuccess, (state): OrchState => ({
    ...state,
    fcContainersCleaning: false,
  })),
  on(OrchActions.cleanupFcContainersFailure, (state, {error}): OrchState => ({
    ...state,
    fcContainersCleaning: false,
    error,
  })),
);
