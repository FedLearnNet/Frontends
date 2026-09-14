import {createAction, props} from '@ngrx/store';
import {FileContentDTO, FileDTO, FileProfile, FileRenameDTO} from "@shared-lib/modules/files/dto/file";

export const loadFiles = createAction('[Files] Load Files');
export const loadFilesSuccess = createAction(
  '[Files] Load Files Success',
  props<{ files: FileDTO[] }>()
);
export const loadFilesFailure = createAction(
  '[Files] Load Files Failure',
  props<{ error: unknown }>()
);

export const loadFile = createAction('[Files] Load File',
  props<{ id: number; secret?: string | null }>());
export const loadFileSuccess = createAction(
  '[Files] Load File Success',
  props<{ file: FileDTO }>()
);
export const loadFileFailure = createAction(
  '[Files] Load File Failure',
  props<{ id: number; error: unknown }>()
);

export const uploadFile = createAction(
  '[Files] Upload File',
  props<{ file: File }>()
);
export const uploadFileSuccess = createAction(
  '[Files] Upload File Success',
  props<{ file: FileDTO }>()
);
export const uploadFileFailure = createAction(
  '[Files] Upload File Failure',
  props<{ error: unknown }>()
);

export const deleteFile = createAction(
  '[Files] Delete File',
  props<{ id: number; secret?: string | null }>()
);
export const deleteFileSuccess = createAction(
  '[Files] Delete File Success',
  props<{ id: number }>()
);
export const deleteFileFailure = createAction(
  '[Files] Delete File Failure',
  props<{ id: number; error: unknown }>()
);

export const renameFile = createAction(
  '[Files] Rename File',
  props<{ id: number; dto: FileRenameDTO; secret?: string | null }>()
);
export const renameFileSuccess = createAction(
  '[Files] Rename File Success',
  props<{ file: FileDTO }>()
);
export const renameFileFailure = createAction(
  '[Files] Rename File Failure',
  props<{ id: number; error: unknown }>()
);

export const getFile = createAction(
  '[Files] Get File',
  props<{ id: number; secret?: string | null }>()
);
export const getFileSuccess = createAction(
  '[Files] Get File Success',
  props<{ file: FileDTO }>()
);
export const getFileFailure = createAction(
  '[Files] Get File Failure',
  props<{ id: number; error: unknown }>()
);

export const getFileContent = createAction(
  '[Files] Get File Content',
  props<{ id: number; secret?: string | null }>()
);
export const getFileContentSuccess = createAction(
  '[Files] Get File Content Success',
  props<{ id: number; content: FileContentDTO }>()
);
export const getFileContentFailure = createAction(
  '[Files] Get File Content Failure',
  props<{ id: number; error: unknown }>()
);

export const getFileProfile = createAction(
  '[Files] Get File Profile',
  props<{ id: number; secret?: string | null }>()
);
export const getFileProfileSuccess = createAction(
  '[Files] Get File Profile Success',
  props<{ id: number; profile: FileProfile }>()
);
export const getFileProfileFailure = createAction(
  '[Files] Get File Profile Failure',
  props<{ id: number; error: unknown }>()
);

export const downloadFile = createAction(
  '[Files] Download File',
  props<{ id: number; secret?: string | null }>()
);
export const downloadFileSuccess = createAction(
  '[Files] Download File Success',
  props<{ id: number; el: HTMLAnchorElement; }>()
);
export const downloadFileFailure = createAction(
  '[Files] Download File Failure',
  props<{ id: number; error: unknown }>()
);
