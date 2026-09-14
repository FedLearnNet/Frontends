import {inject, Injectable} from '@angular/core';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import {TrainingReviewActions} from './training-review.actions';
import {catchError, map, of, switchMap} from 'rxjs';
import {TrainingService} from "@local-app/data-review/services/training.service";

@Injectable()
export class TrainingReviewEffects {
  private readonly actions$ = inject(Actions);
  private readonly api = inject(TrainingService);

  loadPage$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(TrainingReviewActions.loadPage),
      switchMap(({page, pageSize, status}) =>
        this.api.getAllTrainings(page, pageSize, status).pipe(
          map(resp =>
            TrainingReviewActions.loadPageSuccess({
              items: resp.results ?? resp.results ?? [],
              page: resp.page ?? page ?? 1,
              pageSize: resp.pageSize ?? pageSize ?? 10,
              total: resp.totalCount ?? 0,
              status,
            })
          ),
          catchError(error => of(TrainingReviewActions.loadPageFailure({error})))
        )
      )
    )
  });

  updateStatus$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(TrainingReviewActions.updateStatus),
      switchMap(({id, status, requestPatients, modelCanBePublic}) =>
        this.api.updateTrainingStatus(id, status, requestPatients, modelCanBePublic).pipe(
          map(updated => TrainingReviewActions.updateStatusSuccess({id, updated})),
          catchError(error => of(TrainingReviewActions.updateStatusFailure({id, error})))
        )
      )
    )
  });
}
