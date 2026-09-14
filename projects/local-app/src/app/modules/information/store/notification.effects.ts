import {inject, Injectable} from '@angular/core';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import {catchError, map, of, switchMap} from 'rxjs';
import {NotificationActions} from './notification.actions';
import {NotificationService} from '@local-app/information/services/notification.service';
import {UserInformationService} from '@local-app/information/services/user-information.service';

@Injectable()
export class NotificationEffects {
  private readonly actions$ = inject(Actions);
  private readonly api = inject(NotificationService);
  private readonly userInfoApi = inject(UserInformationService);

  loadAll$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(NotificationActions.loadAll),
      switchMap(() => this.api.list().pipe(
        map(items => NotificationActions.loadAllSuccess({items: items ?? []})),
        catchError(error => of(NotificationActions.loadAllFailure({error})))
      ))
    )
  });

  loadUserInfo$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(NotificationActions.loadUserInfo),
      switchMap(() => this.userInfoApi.getBaseUserInformation().pipe(
        map(info => NotificationActions.loadUserInfoSuccess({info})),
        catchError(error => of(NotificationActions.loadUserInfoFailure({error})))
      ))
    )
  });

  markAsRead$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(NotificationActions.markAsRead),
      switchMap(({id}) => this.api.markAsRead(id).pipe(
        map(updated => NotificationActions.markAsReadSuccess({updated})),
        catchError(error => of(NotificationActions.markAsReadFailure({id, error})))
      ))
    )
  });

  archive$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(NotificationActions.archive),
      switchMap(({id}) => this.api.archive(id).pipe(
        map(updated => NotificationActions.archiveSuccess({updated})),
        catchError(error => of(NotificationActions.archiveFailure({id, error})))
      ))
    )
  });

  delete$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(NotificationActions.delete),
      switchMap(({id}) => this.api.delete(id).pipe(
        map(() => NotificationActions.deleteSuccess({id})),
        catchError(error => of(NotificationActions.deleteFailure({id, error})))
      ))
    )
  });
}
