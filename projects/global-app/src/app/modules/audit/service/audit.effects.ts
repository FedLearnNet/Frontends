import {inject, Injectable} from '@angular/core';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import {catchError, map, of, switchMap} from 'rxjs';
import {AuditActions} from './audit.actions';
import {AuditService} from "./audit.service";

@Injectable()
export class AuditEffects {
  private actions$ = inject(Actions);
  private service: AuditService = inject(AuditService);

  loadPending$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(AuditActions.loadPending),
      switchMap(() =>
        this.service.listPending().pipe(
          map(rows => AuditActions.loadPendingSuccess({rows})),
          catchError(e => of(AuditActions.loadPendingFailure({error: this.err(e)})))
        )
      )
    )
  });

  loadByVersion$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(AuditActions.loadByVersion),
      switchMap(({appVersionId}) =>
        this.service.getByVersion(appVersionId).pipe(
          map(audit => AuditActions.loadByVersionSuccess({appVersionId, audit})),
          catchError(e => of(AuditActions.loadByVersionFailure({appVersionId, error: this.err(e)})))
        )
      )
    )
  });
  
  loadById$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(AuditActions.loadById),
      switchMap(({id}) =>
        this.service.get(id).pipe(
          map(audit => AuditActions.loadByIdSuccess({audit})),
          catchError(e => of(AuditActions.loadByIdFailure({id, error: this.err(e)})))
        )
      )
    )
  });

  create$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(AuditActions.create),
      switchMap(({dto}) =>
        this.service.create(dto).pipe(
          map(created => AuditActions.createSuccess({created})),
          catchError(e => of(AuditActions.createFailure({error: this.err(e)})))
        )
      )
    )
  });

  update$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(AuditActions.update),
      switchMap(({id, dto}) =>
        this.service.update(id, dto).pipe(
          map(updated => AuditActions.updateSuccess({updated})),
          catchError(e => of(AuditActions.updateFailure({id, error: this.err(e)})))
        )
      )
    )
  });

  delete$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(AuditActions.delete),
      switchMap(({id}) =>
        this.service.delete(id).pipe(
          map(() => AuditActions.deleteSuccess({id})),
          catchError(err => {
            return of(AuditActions.deleteFailure({id, error: this.err(err)}));
          })
        )
      )
    )
  });

  private err(e: any): string {
    return e?.error?.message ?? e?.message ?? 'Unknown error';
  }
}
