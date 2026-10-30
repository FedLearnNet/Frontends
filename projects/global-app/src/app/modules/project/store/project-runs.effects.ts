import {inject, Injectable} from '@angular/core';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import {catchError, concat, concatMap, map, mergeMap, of, switchMap} from 'rxjs';
import {ProjectExperimentService} from "@global-app/project/services/project-experiment-service";
import {ProjectRunsActions} from "@global-app/project/store/project-runs.actions";

@Injectable()
export class ProjectRunsEffects {
  private readonly actions$ = inject(Actions);
  private readonly api = inject(ProjectExperimentService);

  loadList$ = createEffect(() => this.actions$.pipe(
    ofType(ProjectRunsActions.loadList),
    switchMap(({projectId, kind}) => this.api.list(projectId, kind).pipe(
      map(runs => ProjectRunsActions.loadListSuccess({projectId, kind, runs})),
      catchError(error => of(ProjectRunsActions.failure({error})))
    ))
  ));

  create$ = createEffect(() => this.actions$.pipe(
    ofType(ProjectRunsActions.create),
    concatMap(({projectId, kind, dto}) => this.api.create(projectId, kind, dto).pipe(
      map(run => ProjectRunsActions.runChanged({run})),
      catchError(error => of(ProjectRunsActions.failure({error})))
    ))
  ));

  start$ = createEffect(() => this.actions$.pipe(
    ofType(ProjectRunsActions.start),
    concatMap(({projectId, kind, runId}) => this.api.start(projectId, kind, runId).pipe(
      mergeMap(run => [ProjectRunsActions.runChanged({run}), ProjectRunsActions.follow({projectId, kind, runId})]),
      catchError(error => of(ProjectRunsActions.failure({error})))
    ))
  ));

  stop$ = createEffect(() => this.actions$.pipe(
    ofType(ProjectRunsActions.stop),
    concatMap(({projectId, kind, runId}) => this.api.stop(projectId, kind, runId).pipe(
      map(run => ProjectRunsActions.runChanged({run})),
      catchError(error => of(ProjectRunsActions.failure({error})))
    ))
  ));

  // The followed run until it ended or another one is followed.
  follow$ = createEffect(() => this.actions$.pipe(
    ofType(ProjectRunsActions.follow),
    switchMap(({projectId, kind, runId}) => concat(
      this.api.follow(projectId, kind, runId).pipe(
        map(run => ProjectRunsActions.runChanged({run})),
        catchError(error => of(ProjectRunsActions.failure({error})))
      ),
      of(ProjectRunsActions.followEnded({runId}))
    ))
  ));

  createTest$ = createEffect(() => this.actions$.pipe(
    ofType(ProjectRunsActions.createTest),
    concatMap(({projectId}) => this.api.createTest(projectId).pipe(
      mergeMap(run => [ProjectRunsActions.testChanged({run}), ProjectRunsActions.followTest({projectId})]),
      catchError(error => of(ProjectRunsActions.failure({error})))
    ))
  ));

  followTest$ = createEffect(() => this.actions$.pipe(
    ofType(ProjectRunsActions.followTest),
    switchMap(({projectId}) => concat(
      this.api.followTest(projectId).pipe(
        map(run => ProjectRunsActions.testChanged({run})),
        catchError(error => of(ProjectRunsActions.failure({error})))
      ),
      of(ProjectRunsActions.followTestEnded())
    ))
  ));

  loadDetail$ = createEffect(() => this.actions$.pipe(
    ofType(ProjectRunsActions.loadDetail),
    switchMap(({projectId, runId}) => this.api.detail(projectId, runId).pipe(
      map(run => ProjectRunsActions.loadDetailSuccess({run})),
      catchError(error => of(ProjectRunsActions.failure({error})))
    ))
  ));
}
