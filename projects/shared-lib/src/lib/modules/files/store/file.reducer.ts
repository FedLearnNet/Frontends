import {createReducer, on} from '@ngrx/store';
import * as FileActions from './file.actions';
import {FileContentDTO, FileDTO, FileProfile} from "@shared-lib/modules/files/dto/file";

export interface FilesState {
  files: FileDTO[];
  selectedFile: FileDTO | null;

  currentUpload: { [key: string]: { progress: number; inProgress: boolean; result?: FileDTO } };

  fileContents: { [fileId: number]: FileContentDTO | undefined };
  fileProfiles: { [fileId: number]: FileProfile | undefined };

  downloading: { [fileId: number]: boolean };

  loading: boolean;
  error: any;

  loadedByFileId: { [fileId: number]: boolean };
  loadingByFileId: { [fileId: number]: boolean };
  errorByFileId: { [fileId: number]: any };
}

export const initialFilesState: FilesState = {
  files: [],
  selectedFile: null,
  currentUpload: {},
  fileContents: {},
  fileProfiles: {},
  downloading: {},
  loading: false,
  error: null,
  loadingByFileId: {},
  loadedByFileId: {},
  errorByFileId: {},
};

export const featureKey = 'files';

export const filesReducer = createReducer(
  initialFilesState,

  on(FileActions.loadFiles, (state): FilesState => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(FileActions.loadFilesSuccess, (state, {files}): FilesState => ({
    ...state,
    files,
    loading: false,
  })),
  on(FileActions.loadFilesFailure, (state, {error}): FilesState => ({
    ...state,
    loading: false,
    error,
  })),
  on(FileActions.loadFile, (state, {id}): FilesState => ({
    ...state,
    loadedByFileId: {...state.loadedByFileId, [id]: false},
    loadingByFileId: {...state.loadingByFileId, [id]: true},
    errorByFileId: {...state.errorByFileId, [id]: null},
  })),
  on(FileActions.loadFileSuccess, (state, {file}): FilesState => ({
    ...state,
    loadedByFileId: {...state.loadedByFileId, [file.id]: true},
    loadingByFileId: {...state.loadingByFileId, [file.id]: false},
    errorByFileId: {...state.errorByFileId, [file.id]: null},
    selectedFile: file,
  })),
  on(FileActions.loadFileFailure, (state, {id, error}): FilesState => ({
    ...state,
    loadedByFileId: {...state.loadedByFileId, [id]: false},
    loadingByFileId: {...state.loadingByFileId, [id]: false},
    errorByFileId: {...state.errorByFileId, [id]: error},
    selectedFile: null,
  })),
  on(FileActions.uploadFile, (state): FilesState => ({
    ...state,
    currentUpload: {...state.currentUpload, global: {progress: 0, inProgress: true}},
    error: null,
  })),
  on(FileActions.uploadFileSuccess, (state, {file}): FilesState => ({
    ...state,
    files: [...state.files, file],
    currentUpload: {...state.currentUpload, global: {progress: 100, inProgress: false, result: file}},
  })),
  on(FileActions.uploadFileFailure, (state, {error}): FilesState => ({
    ...state,
    error,
    currentUpload: {...state.currentUpload, global: {progress: 0, inProgress: false}},
  })),

  on(FileActions.deleteFile, (state, {id}): FilesState => ({
    ...state,
    errorByFileId: {...state.errorByFileId, [id]: null},
  })),
  on(FileActions.deleteFileSuccess, (state, {id}): FilesState => ({
    ...state,
    files: state.files.filter(f => f.id !== id),
  })),
  on(FileActions.deleteFileFailure, (state, {id, error}): FilesState => ({
    ...state,
    errorByFileId: {...state.errorByFileId, [id]: error},
    error,
  })),

  on(FileActions.renameFile, (state): FilesState => ({
    ...state,
    error: null,
  })),
  on(FileActions.renameFileSuccess, (state, {file}): FilesState => ({
    ...state,
    files: state.files.map(f => (f.id === file.id ? file : f)),
    selectedFile: state.selectedFile ? (state.selectedFile?.id === file.id ? file : state.selectedFile) : null
  })),
  on(FileActions.renameFileFailure, (state, {id, error}): FilesState => ({
    ...state,
    errorByFileId: {...state.errorByFileId, [id]: error},
    error,
  })),

  on(FileActions.getFile, (state): FilesState => ({
    ...state,
    error: null,
  })),
  on(FileActions.getFileSuccess, (state, {file}): FilesState => ({
    ...state,
    files: state.files.some(f => f.id === file.id)
      ? state.files.map(f => (f.id === file.id ? file : f))
      : [...state.files, file],
  })),
  on(FileActions.getFileFailure, (state, {id, error}): FilesState => ({
    ...state,
    errorByFileId: {...state.errorByFileId, [id]: error},
    error,
  })),

  on(FileActions.getFileContent, (state, {id}): FilesState => ({
    ...state,
    loadedByFileId: {...state.loadedByFileId, [id]: false},
    loadingByFileId: {...state.loadingByFileId, [id]: true},
    errorByFileId: {...state.errorByFileId, [id]: null},
  })),
  on(FileActions.getFileContentSuccess, (state, {id, content}): FilesState => ({
    ...state,
    loadedByFileId: {...state.loadedByFileId, [id]: true},
    loadingByFileId: {...state.loadingByFileId, [id]: false},
    errorByFileId: {...state.errorByFileId, [id]: null},
    fileContents: {...state.fileContents, [id]: content},
  })),
  on(FileActions.getFileContentFailure, (state, {id, error}): FilesState => ({
    ...state,
    loadedByFileId: {...state.loadedByFileId, [id]: false},
    loadingByFileId: {...state.loadingByFileId, [id]: false},
    fileContents: {...state.fileContents, [id]: undefined},
    errorByFileId: {...state.errorByFileId, [id]: error},
    error,
  })),

  on(FileActions.getFileProfile, (state, {id}): FilesState => ({
    ...state,
    loadedByFileId: {...state.loadedByFileId, [id]: false},
    loadingByFileId: {...state.loadingByFileId, [id]: true},
    errorByFileId: {...state.errorByFileId, [id]: null},
  })),
  on(FileActions.getFileProfileSuccess, (state, {id, profile}): FilesState => ({
    ...state,
    loadedByFileId: {...state.loadedByFileId, [id]: true},
    loadingByFileId: {...state.loadingByFileId, [id]: false},
    errorByFileId: {...state.errorByFileId, [id]: null},
    fileProfiles: {...state.fileProfiles, [id]: profile},
  })),
  on(FileActions.getFileProfileFailure, (state, {id, error}): FilesState => ({
    ...state,
    loadedByFileId: {...state.loadedByFileId, [id]: false},
    loadingByFileId: {...state.loadingByFileId, [id]: false},
    errorByFileId: {...state.errorByFileId, [id]: error},
    fileProfiles: {...state.fileProfiles, [id]: undefined},
  })),

  on(FileActions.downloadFile, (state, {id}): FilesState => ({
    ...state,
    downloading: {...state.downloading, [id]: true},
    errorByFileId: {...state.errorByFileId, [id]: null},
  })),
  on(FileActions.downloadFileSuccess, (state, {id}): FilesState => ({
    ...state,
    downloading: {...state.downloading, [id]: false},
  })),
  on(FileActions.downloadFileFailure, (state, {id, error}): FilesState => ({
    ...state,
    downloading: {...state.downloading, [id]: false},
    errorByFileId: {...state.errorByFileId, [id]: error},
    error,
  })),
);
