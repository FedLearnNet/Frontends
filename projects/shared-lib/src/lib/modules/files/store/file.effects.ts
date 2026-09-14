import {inject, Injectable} from '@angular/core';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import * as FileActions from './file.actions';
import {catchError, EMPTY, filter, map, mergeMap, of, switchMap} from 'rxjs';
import {FileService} from "@shared-lib/modules/files/store/file.service";
import {UploadFileProgress} from "@shared-lib/modules/files/dto/file";

@Injectable()
export class FileEffects {
  private readonly actions$ = inject(Actions);
  private readonly service: FileService = inject(FileService);

  loadFiles$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(FileActions.loadFiles),
      switchMap(() =>
        this.service.listFiles().pipe(
          map((files) => FileActions.loadFilesSuccess({files})),
          catchError((error) => of(FileActions.loadFilesFailure({error})))
        )
      )
    )
  });
  loadFile$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(FileActions.loadFile),
      switchMap(({id, secret}) =>
        this.service.getFile(id, secret).pipe(
          map((file) => FileActions.loadFileSuccess({file})),
          catchError((error) => of(FileActions.loadFileFailure({id, error})))
        )
      )
    )
  });
  uploadFile$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(FileActions.uploadFile),
      mergeMap(({file}) =>
        this.service.upload(file).pipe(
          filter((u: UploadFileProgress) => !!u.result),
          map(({result}) => FileActions.uploadFileSuccess({file: result!})),
          catchError((error) => of(FileActions.uploadFileFailure({error})))
        )
      )
    )
  });

  deleteFile$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(FileActions.deleteFile),
      mergeMap(({id, secret}) =>
        this.service.deleteFile(id, secret).pipe(
          map(() => FileActions.deleteFileSuccess({id})),
          catchError((error) => of(FileActions.deleteFileFailure({id, error})))
        )
      )
    )
  });

  renameFile$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(FileActions.renameFile),
      mergeMap(({id, dto, secret}) =>
        this.service.renameFile(id, dto.fileName, secret).pipe(
          map((file) => FileActions.renameFileSuccess({file})),
          catchError((error) => of(FileActions.renameFileFailure({id, error})))
        )
      )
    )
  });

  getFile$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(FileActions.getFile),
      mergeMap(({id, secret}) =>
        this.service.getFile(id, secret).pipe(
          map((file) => FileActions.getFileSuccess({file})),
          catchError((error) => of(FileActions.getFileFailure({id, error})))
        )
      )
    )
  });

  getFileContent$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(FileActions.getFileContent),
      mergeMap(({id, secret}) =>
        this.service.getFileContent(id, secret).pipe(
          map((content) => FileActions.getFileContentSuccess({id, content})),
          catchError((error) => of(FileActions.getFileContentFailure({id, error})))
        )
      )
    )
  });

  getFileProfile$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(FileActions.getFileProfile),
      mergeMap(({id, secret}) =>
        this.service.getFileProfile(id, secret).pipe(
          map((profile) => FileActions.getFileProfileSuccess({id, profile})),
          catchError((error) => of(FileActions.getFileProfileFailure({id, error})))
        )
      )
    )
  });

  downloadFile$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(FileActions.downloadFile),
      mergeMap(({id, secret}) =>
        this.service.downloadFile(id, secret).pipe(
          map((el) =>
            FileActions.downloadFileSuccess({id, el})
          ),
          catchError((error) => of(FileActions.downloadFileFailure({id, error})))
        )
      )
    )
  });

  downloadFileSuccess$ = createEffect(() => {
      return this.actions$.pipe(
        ofType(FileActions.downloadFileSuccess),
        mergeMap(({el}) => {
            el.click();
            return EMPTY;
          }
        )
      )
    },
    {dispatch: false}
  );
}
