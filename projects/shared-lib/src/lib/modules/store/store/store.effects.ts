import {inject, Injectable} from '@angular/core';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import {concatLatestFrom} from '@ngrx/operators';
import {StoreActions} from './store.actions';
import {catchError, map, of, switchMap} from 'rxjs';
import {StoreService} from "@shared-lib/modules/store/store/store.service";
import {selectListRequestParams} from "@shared-lib/modules/store/store/store.selectors";
import {Store} from "@ngrx/store";
import {StoreRatingsService} from "@shared-lib/modules/store/store/store-rating.service";
import {MatSnackBar} from "@angular/material/snack-bar";
import {TranslateService} from "@ngx-translate/core";

@Injectable()
export class StoreEffects {
  private readonly actions$: Actions = inject(Actions);
  private readonly api: StoreService = inject(StoreService);
  private readonly apiRating: StoreRatingsService = inject(StoreRatingsService);
  private readonly snackBar: MatSnackBar = inject(MatSnackBar);
  private readonly store: Store = inject(Store);
  private readonly translate: TranslateService = inject(TranslateService);

  loadList$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(StoreActions.loadList),
      switchMap(({params}) =>
        this.api.list(params).pipe(
          map(response => StoreActions.loadListSuccess({response})),
          catchError(error => of(StoreActions.loadListFailure({error})))
        )
      )
    )
  });

  loadNextPage$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(StoreActions.loadNextPage),
      concatLatestFrom(() => this.store.select(selectListRequestParams)),
      switchMap(([_action, params]) => {
        const nextPage = (params.page ?? 0) + 1;
        return of(StoreActions.loadList({params: {...params, page: nextPage}}));
      })
    )
  });


  loadGraph$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(StoreActions.loadGraph),
      switchMap(({params}) =>
        this.api.graph(params).pipe(
          map(response => StoreActions.loadGraphSuccess({response})),
          catchError(error => of(StoreActions.loadGraphFailure({error})))
        )
      )
    )
  });

  loadGraphAndPath$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(StoreActions.loadGraphAndPaths),
      switchMap(({from, to, many, params}) =>
        of(
          StoreActions.loadGraph({params}),
          StoreActions.loadGraphPaths({from, to, many, params})
        )
      )
    )
  });

  loadGraphPaths$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(StoreActions.loadGraphPaths),
      switchMap(({from, to, many, params}) =>
        this.api.graphShortsPath(from, to, many, params).pipe(
          map(response => StoreActions.loadGraphPathsSuccess({response})),
          catchError(error => of(StoreActions.loadGraphPathsFailure({error})))
        )
      )
    )
  });

  loadModel$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(StoreActions.loadModel),
      switchMap(({id}) =>
        this.api.getModel(id).pipe(
          map(item => StoreActions.loadModelSuccess({item})),
          catchError(error => of(StoreActions.loadModelFailure({error})))
        )
      )
    )
  });

  loadApp$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(StoreActions.loadApp),
      switchMap(({idOrSlug}) =>
        this.api.getApp(idOrSlug).pipe(
          map(item => StoreActions.loadAppSuccess({item})),
          catchError(error => of(StoreActions.loadAppFailure({error})))
        )
      )
    )
  });

  loadAppByVersion$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(StoreActions.loadAppByVersion),
      switchMap(({appVersionId}) =>
        this.api.getAppVersion(appVersionId).pipe(
          map(item => StoreActions.loadAppSuccess({item})),
          catchError(error => of(StoreActions.loadAppFailure({error})))
        )
      )
    )
  });

  loadAppByVersions$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(StoreActions.loadAppsByVersions),
      switchMap(({appVersionIds}) =>
        this.api.getAppVersions(appVersionIds).pipe(
          map(items => StoreActions.loadAppsByVersionsSuccess({items})),
          catchError(error => of(StoreActions.loadAppsByVersionsFailure({error})))
        )
      )
    )
  });

  loadAppRating$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(StoreActions.loadAppRatings),
      switchMap(({appId}) =>
        this.apiRating.listForApp(appId).pipe(
          map(items => StoreActions.loadAppRatingsSuccess({appId, items})),
          catchError(error => of(StoreActions.loadAppRatingsFailure({appId, error})))
        )
      )
    )
  });

  loadModelRating$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(StoreActions.loadModelRatings),
      switchMap(({modelId}) =>
        this.apiRating.listForModel(modelId).pipe(
          map(items => StoreActions.loadModelRatingsSuccess({modelId, items})),
          catchError(error => of(StoreActions.loadModelRatingsFailure({modelId, error})))
        )
      )
    )
  });

  createAppRating$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(StoreActions.createAppRating),
      switchMap(({appId, dto}) =>
        this.apiRating.createForApp(appId, dto).pipe(
          map(rating => {
            this.snackBar.open(
              this.translate.instant('SUCCESSFULLY_CREATED', {name: this.translate.instant('LABEL.RATING').toLowerCase()}),
              this.translate.instant('BUTTON.CLOSE'),
              {duration: 3000}
            );
            return StoreActions.createAppRatingSuccess({appId, rating});
          }),
          catchError(error => of(StoreActions.createAppRatingFailure({appId, error})))
        )
      )
    )
  });

  createModelRating$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(StoreActions.createModelRating),
      switchMap(({modelVersionId, dto}) =>
        this.apiRating.createForModel(modelVersionId, dto).pipe(
          map(rating => {
            this.snackBar.open(
              this.translate.instant('SUCCESSFULLY_CREATED', {name: this.translate.instant('LABEL.RATING').toLowerCase()}),
              this.translate.instant('BUTTON.CLOSE'),
              {duration: 3000}
            );
            return StoreActions.createModelRatingSuccess({modelVersionId: modelVersionId, rating});
          }),
          catchError(error => of(StoreActions.createModelRatingFailure({modelVersionId: modelVersionId, error})))
        )
      )
    )
  });
}
