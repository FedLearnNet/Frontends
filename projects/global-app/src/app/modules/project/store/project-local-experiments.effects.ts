import {ProjectExperimentService} from "@global-app/project/services/project-experiment-service";
import {inject, Injectable} from '@angular/core';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import { concatLatestFrom } from '@ngrx/operators';
import {
  catchError,
  concatMap,
  EMPTY,
  map,
  merge,
  mergeMap,
  of,
  switchMap,
  takeUntil,
} from 'rxjs';
import {ProjectLocalExperimentsActions} from "@global-app/project/store/project-local-experiments.actions";

import {Store} from '@ngrx/store';
import {selectSelectedExperiment} from '@global-app/project/store/project-local-experiments.selectors';

@Injectable()
export class ProjectLocalExperimentsEffects {
  private readonly actions$ = inject(Actions);
  private readonly api = inject(ProjectExperimentService);
  private readonly store = inject(Store);

  loadList$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(ProjectLocalExperimentsActions.loadList),
      switchMap(({projectId}) =>
        this.api.getLocalFederatedExperiments(projectId).pipe(
          map(items => ProjectLocalExperimentsActions.loadListSuccess({projectId, items})),
          catchError(error => of(ProjectLocalExperimentsActions.loadListError({projectId, error})))
        )
      )
    )
  });

  create$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(ProjectLocalExperimentsActions.create),
      concatMap(({projectId, dto}) =>
        this.api.createLocalExperiment(projectId, dto).pipe(
          map(item => ProjectLocalExperimentsActions.createSuccess({projectId, item})),
          catchError(error => of(ProjectLocalExperimentsActions.createError({projectId, error})))
        )
      )
    )
  });

  startLocalExperiment$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(ProjectLocalExperimentsActions.startLocalExperiment),
      switchMap(({projectId, experimentId}) =>
        this.api.startLocalExperiment(projectId, experimentId).pipe(
          map(experiment => ProjectLocalExperimentsActions.startLocalExperimentSuccess({projectId, experiment})),
          catchError(error => of(ProjectLocalExperimentsActions.startLocalExperimentFailure({
            projectId,
            experimentId,
            error
          })))
        )
      )
    )
  });

  stopLocalExperiment$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(ProjectLocalExperimentsActions.stopLocalExperiment),
      switchMap(({projectId, experimentId}) =>
        this.api.stopLocalExperiment(projectId, experimentId).pipe(
          map(experiment => ProjectLocalExperimentsActions.stopLocalExperimentSuccess({projectId, experiment})),
          catchError(error => of(ProjectLocalExperimentsActions.stopLocalExperimentFailure({
            projectId,
            experimentId,
            error
          })))
        )
      )
    )
  });

  createTest$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(ProjectLocalExperimentsActions.createTest),
      concatMap(({projectId}) =>
        this.api.createLocalTestExperiment(projectId).pipe(
          map(item => ProjectLocalExperimentsActions.createTestSuccess({projectId, item})),
          catchError(error => of(ProjectLocalExperimentsActions.createTestError({projectId, error})))
        )
      )
    )
  });


  loadExperiment$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(ProjectLocalExperimentsActions.loadExperiment),
      switchMap(({projectId, id}) => {
        const stop$ = this.actions$.pipe(
          ofType(ProjectLocalExperimentsActions.liveDisconnected),
        );

        const connected$ = of(ProjectLocalExperimentsActions.liveConnected({
          projectId,
          channel: 'experiment',
          experimentId: id
        }));

        const stream$ = this.api.streamExperiment(projectId, id).pipe(
          map(payload => ProjectLocalExperimentsActions.loadExperimentSuccess({experiment: payload})),
          takeUntil(stop$),
          catchError(error => of(ProjectLocalExperimentsActions.loadExperimentError({projectId, id, error})))
        );

        return merge(connected$, stream$);
      })
    )
  });

  loadExperimentTest$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(ProjectLocalExperimentsActions.loadExperimentTest),
      switchMap(({projectId}) => {
        const stop$ = this.actions$.pipe(
          ofType(ProjectLocalExperimentsActions.liveDisconnected),
        );



        const connected$ = of(ProjectLocalExperimentsActions.liveConnected({projectId, channel: 'test'}));

        const stream$ = this.api.streamExperimentTest(projectId).pipe(
          map(payload => ProjectLocalExperimentsActions.loadExperimentTestSuccess({experiment: payload})),
          takeUntil(stop$),
          catchError(error => of(ProjectLocalExperimentsActions.loadExperimentTestError({error})))
        );

        return merge(connected$, stream$);
      })
    )
  });

  reconnectOnDisconnect$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(ProjectLocalExperimentsActions.liveDisconnected),
      mergeMap(({channel, projectId, experimentId}) =>
        channel === 'experiment' && experimentId != null
          ? of(ProjectLocalExperimentsActions.loadExperiment({projectId, id: experimentId}))
          : channel === 'test'
            ? of(ProjectLocalExperimentsActions.loadExperimentTest({projectId}))
            : of()
      )
    )
  });

  loadLocalStepDetail$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(ProjectLocalExperimentsActions.loadLocalStepDetail),
      switchMap(({projectId, experimentId, stepId}) =>
        this.api.getLocalStepDetailUpdates(projectId, experimentId, stepId).pipe(
          map(detail => ProjectLocalExperimentsActions.loadLocalStepDetailSuccess({
            projectId,
            experimentId,
            stepId,
            detail
          })),
          catchError(error => of(ProjectLocalExperimentsActions.loadLocalStepDetailError({
            projectId,
            experimentId,
            stepId,
            error
          })))
        )
      )
    )
  });

  loadLocalStepMessages$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(ProjectLocalExperimentsActions.loadLocalStepMessages),
      switchMap(({projectId, experimentId, stepId}) =>
        this.api.streamLocalLogMessages(projectId, experimentId, stepId).pipe(
          map(message => ProjectLocalExperimentsActions.loadLocalStepMessagesSuccess({
            projectId,
            experimentId,
            stepId,
            message
          })),
          catchError(error => of(ProjectLocalExperimentsActions.loadLocalStepMessagesError({
            projectId,
            experimentId,
            stepId,
            error
          })))
        )
      )
    )
  });

  selectLocalStep$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(ProjectLocalExperimentsActions.selectLocalStep),
      concatLatestFrom(() => this.store.select(selectSelectedExperiment)),
      mergeMap(([{nodeId}, experiment]) => {
        if (!experiment) {
          return EMPTY;
        }

        const experimentId = experiment.id;
        const projectId = experiment.projectId;
        const steps = Array.isArray(experiment.steps) ? experiment.steps : [];

        const step = steps.find((s: any) => s?.workflowNodeId === nodeId);
        if (!step) {
          return EMPTY;
        }
        return of(ProjectLocalExperimentsActions.loadLocalStepDetail({projectId, experimentId, stepId: step.id}));
      })
    )
  });

  selectLocalStepMessages$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(ProjectLocalExperimentsActions.selectLocalStep),
      concatLatestFrom(() => this.store.select(selectSelectedExperiment)),
      mergeMap(([{nodeId}, experiment]) => {
        if (!experiment) {
          return EMPTY;
        }

        const experimentId = experiment.id;
        const projectId = experiment.projectId;
        const steps = Array.isArray(experiment.steps) ? experiment.steps : [];

        const step = steps.find((s: any) => s?.workflowNodeId === nodeId);
        if (!step) {
          return EMPTY;
        }
        return of(ProjectLocalExperimentsActions.loadLocalStepMessages({projectId, experimentId, stepId: step.id}));
      })
    )
  });
}
