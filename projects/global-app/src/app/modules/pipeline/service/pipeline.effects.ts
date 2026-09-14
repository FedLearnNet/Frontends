import {inject, Injectable} from '@angular/core';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import * as PipelineActions from './pipeline.actions';
import {catchError, map, mergeMap, of, switchMap, takeUntil} from 'rxjs';
import {PipelineService} from "./pipeline.service";

@Injectable()
export class PipelineEffects {
  private readonly actions$: Actions = inject(Actions);
  private readonly service: PipelineService = inject(PipelineService);

  load$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(PipelineActions.loadPipelines),
      switchMap(({appVersionId, appId, modelSubId}) =>
        this.service.list({appVersionId, appId, modelSubId}).pipe(
          map(pipelines => PipelineActions.loadPipelinesSuccess({pipelines})),
          catchError(error => of(PipelineActions.loadPipelinesFailure({error})))
        )
      )
    )
  });

  get$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(PipelineActions.getPipeline),
      mergeMap(({id}) =>
        this.service.get(id).pipe(
          map(pipeline => PipelineActions.getPipelineSuccess({pipeline})),
          catchError(error => of(PipelineActions.getPipelineFailure({error})))
        )
      )
    )
  });

  create$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(PipelineActions.createPipeline),
      mergeMap(({request}) =>
        this.service.create(request).pipe(
          map(pipeline => PipelineActions.createPipelineSuccess({pipeline})),
          catchError(error => of(PipelineActions.createPipelineFailure({error})))
        )
      )
    )
  });

  stop$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(PipelineActions.stopPipeline),
      mergeMap(({id}) =>
        this.service.stop(id).pipe(
          map(pipeline => PipelineActions.stopPipelineSuccess({pipeline})),
          catchError(error => of(PipelineActions.stopPipelineFailure({error})))
        )
      )
    )
  });

  /**
   * Stream: starts EventSource and emits updates until Stop action.
   */
  stream$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(PipelineActions.startPipelineStream),
      switchMap(({id}) =>
        this.service.stream(id).pipe(
          map(pipeline => PipelineActions.pipelineStreamMessage({pipeline})),
          catchError(error => of(PipelineActions.pipelineStreamError({error}))),
          takeUntil(this.actions$.pipe(ofType(PipelineActions.stopPipelineStream)))
        )
      )
    )
  });

}
