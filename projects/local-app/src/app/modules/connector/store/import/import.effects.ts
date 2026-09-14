import {inject, Injectable} from '@angular/core';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import {Store} from '@ngrx/store';
import {catchError, concatMap, filter, map, mergeMap, of, take, takeUntil, tap} from 'rxjs';
import {ImportActivity, isImportFinished} from '../../dto/import-progress';
import {ImportStreamMessage, ImportUploadSettings} from '../../dto/connector-import';
import {detectFileType} from '../../helper/connector-import-helper';
import {ConnectorImportService} from '../../services/connector-import.service';
import {ImportActions, StartImportRequest} from './import.actions';
import {selectImport} from './import.selectors';

@Injectable()
export class ImportEffects {

  private readonly actions$ = inject(Actions);
  private readonly store = inject(Store);
  private readonly service = inject(ConnectorImportService);


  start$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(ImportActions.startImport),
      mergeMap(({request}) => this.service
        .importStream(
          request.cohortId,
          request.file,
          this.uploadSettings(request),
          request.connectorId,
          request.importId,
        )
        .pipe(
          map(message => this.toAction(request.importId, message)),
          takeUntil(this.actions$.pipe(
            ofType(ImportActions.cancelImport),
            filter(({importId}) => importId === request.importId),
          )),
          catchError(error => of(ImportActions.importStreamFailed({
            importId: request.importId,
            message: this.describe(error),
          }))),
        )),
    );
  });


  follow$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(ImportActions.followImport),
      mergeMap(({importId}) => this.service.followImport(importId).pipe(
        map(message => this.toAction(importId, message)),
        takeUntil(this.actions$.pipe(
          ofType(ImportActions.cancelImport, ImportActions.dismissImport),
          filter(action => action.importId === importId),
        )),
        catchError(() => of()),
      )),
    );
  });

  loadCohortImports$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(ImportActions.loadCohortImports),
      mergeMap(({cohortId, connectorId}) => this.service.getImports(cohortId, connectorId).pipe(
        map(imports => ImportActions.cohortImportsLoaded({imports})),
        catchError(() => of(ImportActions.cohortImportsLoadFailed())),
      )),
    );
  });

  followLoaded$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(ImportActions.cohortImportsLoaded),
      concatMap(({imports}) => imports
        .filter(report => !isImportFinished(report.phase))
        .map(report => ImportActions.followImport({importId: report.importId}))),
    );
  });

  finished$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(ImportActions.importEvent, ImportActions.importStreamFailed),
      map(action => 'event' in action ? action.event.importId : action.importId),
      filter(importId => !this.announced.has(importId)),
      concatMap(importId => this.store.select(selectImport(importId)).pipe(take(1))),
      filter((activity): activity is ImportActivity =>
        activity !== undefined && activity.finishedAt !== undefined),
      tap(activity => this.announced.add(activity.importId)),
      map(activity => ImportActions.importFinished({activity})),
    );
  });

  private readonly announced = new Set<string>();

  private toAction(importId: string, message: ImportStreamMessage) {
    return message.kind === 'upload'
      ? ImportActions.uploadProgress({
        importId,
        loaded: message.loaded,
        total: message.total,
        percent: message.percent,
      })
      : ImportActions.importEvent({event: {...message.event, importId}});
  }

  private uploadSettings(request: StartImportRequest): ImportUploadSettings | undefined {
    const settings: ImportUploadSettings = {
      previewRows: 10,
      supportFile: request.supportFile ?? false,
      ...request.settings,
    };
    if (settings.fileType) {
      return settings;
    }
    return settings.supportFile
      ? {...settings, fileType: detectFileType(request.file.name)}
      : undefined;
  }

  private describe(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }
    if (typeof error === 'string') {
      return error;
    }
    return 'The file could not be imported.';
  }
}
