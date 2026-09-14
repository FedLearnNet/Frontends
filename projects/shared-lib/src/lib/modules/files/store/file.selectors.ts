import {createFeatureSelector, createSelector} from '@ngrx/store';
import {featureKey, FilesState} from './file.reducer';

export const selectFilesState = createFeatureSelector<FilesState>(featureKey);

export const selectAllFiles = createSelector(
  selectFilesState,
  (s) => s.files
);

export const selectSelectedFile = createSelector(
  selectFilesState,
  (s) => s.selectedFile
);

export const selectFilesLoading = createSelector(
  selectFilesState,
  (s) => s.loading
);

export const selectFilesError = createSelector(
  selectFilesState,
  (s) => s.error
);

export const selectCurrentUpload = createSelector(
  selectFilesState,
  (s) => s.currentUpload
);

export const selectCurrentGlobalUpload = createSelector(
  selectFilesState,
  (s) => s.currentUpload["global"]
);


export const selectFileById = (id: number) =>
  createSelector(selectAllFiles, (files) => files.find((f) => f.id === id));

export const selectFileContentById = (id: number) =>
  createSelector(selectFilesState, (s) => s.fileContents[id]);

export const selectFileProfileById = (id: number) =>
  createSelector(selectFilesState, (s) => s.fileProfiles[id]);

export const selectIsDownloading = (id: number) =>
  createSelector(selectFilesState, (s) => !!s.downloading[id]);

export const selectErrorByFileId = (id: number) =>
  createSelector(selectFilesState, (s) => s.errorByFileId[id]);

export const selectLoadedByFileId = (id: number) =>
  createSelector(selectFilesState, (s) => s.loadedByFileId[id] ?? false);

export const selectLoadingByFileId = (id: number) =>
  createSelector(selectFilesState, (s) => s.loadingByFileId[id] ?? false);

export const selectFilesSortedByName = createSelector(selectAllFiles, (files) =>
  [...files].sort((a, b) => a.fileName.localeCompare(b.fileName, undefined, {sensitivity: 'base'}))
);

export const selectFilesTotal = createSelector(selectAllFiles, (files) => files.length);

export const selectFilesByContentType = (contentType: string) =>
  createSelector(selectAllFiles, (files) => files.filter((f) => f.contentType === contentType));

export const selectFilesLargerThan = (bytes: number) =>
  createSelector(selectAllFiles, (files) => files.filter((f) => (f.size ?? 0) > bytes));
