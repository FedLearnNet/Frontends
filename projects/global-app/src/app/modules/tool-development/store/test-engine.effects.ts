import {inject, Injectable} from '@angular/core';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import {concatLatestFrom} from '@ngrx/operators';
import {Store} from '@ngrx/store';
import {catchError, EMPTY, map, mergeMap, of, switchMap, takeUntil} from 'rxjs';
import * as TestEngineActions from './test-engine.actions';
import {selectTestEngineState} from './test-engine.selectors';
import {TestEngineService} from "../service/test-engine.service";
import {isFinalStatus} from "@shared-lib/modules/app-execution/dto/execution-run";

@Injectable()
export class TestEngineEffects {
  private readonly actions$: Actions = inject(Actions);
  private readonly store: Store = inject(Store);
  private readonly service: TestEngineService = inject(TestEngineService);

  load$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(TestEngineActions.loadTestEngines),
      switchMap(({appId}) => this.service.list(appId).pipe(
        map(engines => TestEngineActions.loadTestEnginesSuccess({appId, engines})),
        catchError(() => EMPTY)
      ))
    );
  });

  start$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(TestEngineActions.startTestEngine),
      mergeMap(({appId, create}) => this.service.start(appId, create).pipe(
        map(engine => TestEngineActions.startTestEngineSuccess({engine})),
        catchError(error => of(TestEngineActions.startTestEngineFailure({error})))
      ))
    );
  });

  stop$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(TestEngineActions.stopTestEngine),
      mergeMap(({appId, id}) => this.service.stop(appId, id).pipe(
        map(engine => TestEngineActions.stopTestEngineSuccess({engine})),
        catchError(() => EMPTY)
      ))
    );
  });

  followActive$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(TestEngineActions.loadTestEnginesSuccess, TestEngineActions.startTestEngineSuccess,
        TestEngineActions.stopTestEngineSuccess, TestEngineActions.testEngineStreamMessage),
      concatLatestFrom(() => this.store.select(selectTestEngineState)),
      mergeMap(([, state]) => {
        const active = state.engines.some(engine => !isFinalStatus(engine.status));
        if (active && !state.streaming && state.appId !== undefined) {
          return of(TestEngineActions.startTestEngineStream({appId: state.appId}));
        }
        if (!active && state.streaming) {
          return of(TestEngineActions.stopTestEngineStream());
        }
        return EMPTY;
      })
    );
  });

  stream$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(TestEngineActions.startTestEngineStream),
      switchMap(({appId}) => this.service.stream(appId).pipe(
        map(engine => TestEngineActions.testEngineStreamMessage({engine})),
        catchError(error => of(TestEngineActions.testEngineStreamError({error}))),
        // A new load, e.g. of another app, ends the stream; the load decides again whether one is needed
        takeUntil(this.actions$.pipe(ofType(TestEngineActions.stopTestEngineStream, TestEngineActions.loadTestEngines)))
      ))
    );
  });
}
