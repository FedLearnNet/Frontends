import {inject, Injectable} from '@angular/core';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import {catchError, map, mergeMap} from 'rxjs/operators';
import {of} from 'rxjs';
import * as ModelActions from './model.actions';
import {ModelService} from "@global-app/model-store/services/model.service";

@Injectable()
export class ModelEffects {
  private readonly actions$: Actions = inject(Actions);
  private readonly service: ModelService = inject(ModelService);

  loadModels$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(ModelActions.loadModels),
      mergeMap(() =>
        this.service.getModels().pipe(
          map(models => ModelActions.loadModelsSuccess({models})),
          catchError(error => of(ModelActions.loadModelsFailure({error})))
        )
      )
    )
  });

  loadMyModels$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(ModelActions.loadMyModels),
      mergeMap(({appId, federatedExperimentId, experimentId}) =>
        this.service.getMyModels(appId, experimentId, federatedExperimentId).pipe(
          map(models => ModelActions.loadMyModelsSuccess({models})),
          catchError(error => of(ModelActions.loadMyModelsFailure({error})))
        )
      )
    )
  });

  loadModelDetail$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(ModelActions.loadModelDetail),
      mergeMap(({id}) =>
        this.service.getModel(id).pipe(
          map(detail => ModelActions.loadModelDetailSuccess({detail})),
          catchError(error => of(ModelActions.loadModelDetailFailure({error})))
        )
      )
    )
  });

  loadSubModelForRun$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(ModelActions.loadSubModelForRun),
      mergeMap(({runId}) =>
        this.service.getSubModelForExperimentRun(runId).pipe(
          map(sub => ModelActions.loadSubModelForRunSuccess({sub})),
          catchError(error => of(ModelActions.loadSubModelForRunFailure({error})))
        )
      )
    )
  });

  loadSubModelForExperiment$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(ModelActions.loadModelVersionForExperiment),
      mergeMap(({experimentId, federatedExperimentId}) => {
        if (experimentId) {
          return this.service.getModelVersionForExperiment(experimentId).pipe(
            map(version => ModelActions.loadModelVersionForExperimentSuccess({version})),
            catchError(error => of(ModelActions.loadModelVersionForExperimentFailure({error})))
          );
        } else if (federatedExperimentId) {
          return this.service.getModelVersionForFederatedExperiment(federatedExperimentId).pipe(
            map(version => ModelActions.loadModelVersionForExperimentSuccess({version})),
            catchError(error => of(ModelActions.loadModelVersionForExperimentFailure({error})))
          );
        } else {
          return of(ModelActions.loadModelVersionForExperimentFailure({
            error: new Error('Either experimentId or federatedExperimentId must be provided')
          }));
        }
      })
    );
  });

  selectSubModel$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(ModelActions.selectSubModel),
      mergeMap(({subModelId}) =>
        this.service.selectSubModel(subModelId).pipe(
          map(selected => ModelActions.selectSubModelSuccess({selected})),
          catchError(error => of(ModelActions.selectSubModelFailure({error})))
        )
      )
    )
  });

  updateModel$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(ModelActions.updateModel),
      mergeMap(({ id, dto }) =>
        this.service.updateModel(id, dto).pipe(
          map(model => ModelActions.updateModelSuccess({ model })),
          catchError(error => of(ModelActions.updateModelFailure({ error })))
        )
      )
    );
  });

  updateModelVersion$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(ModelActions.updateModelVersion),
      mergeMap(({ id, modelVersionId, dto }) =>
        this.service.updateModelVersion(id, modelVersionId, dto).pipe(
          map(version => ModelActions.updateModelVersionSuccess({ version })),
          catchError(error => of(ModelActions.updateModelVersionFailure({ error })))
        )
      )
    );
  });
}
