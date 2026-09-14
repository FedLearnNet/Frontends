import {ProjectExperimentService} from "@global-app/project/services/project-experiment-service";
import {inject, Injectable} from '@angular/core';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import {catchError, concatMap, EMPTY, map, merge, mergeMap, of, switchMap, takeUntil} from 'rxjs';
import { concatLatestFrom } from '@ngrx/operators';

import {Store} from '@ngrx/store';
import {ProjectFederatedExperimentsActions} from "@global-app/project/store/project-federated-experiments.actions";
import {selectSelectedExperiment} from "@global-app/project/store/project-federated-experiments.selectors";

@Injectable()
export class ProjectFederatedExperimentsEffects {
  private readonly actions$ = inject(Actions);
  private readonly api = inject(ProjectExperimentService);
  private readonly store = inject(Store);

  loadList$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(ProjectFederatedExperimentsActions.loadList),
      switchMap(({projectId}) =>
        this.api.getProjectFederatedExperiments(projectId).pipe(
          map(items => ProjectFederatedExperimentsActions.loadListSuccess({projectId, items})),
          catchError(error => of(ProjectFederatedExperimentsActions.loadListError({projectId, error})))
        )
      )
    )
  });
  create$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(ProjectFederatedExperimentsActions.create),
      concatMap(({projectId, dto}) =>
        this.api.createFederatedExperiment(projectId, dto).pipe(
          map(item => ProjectFederatedExperimentsActions.createSuccess({projectId, item})),
          catchError(error => of(ProjectFederatedExperimentsActions.createError({projectId, error})))
        )
      )
    )
  });

  startFederatedExperiment$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(ProjectFederatedExperimentsActions.startExperiment),
      switchMap(({projectId, experimentId}) =>
        this.api.startFederatedExperiment(projectId, experimentId).pipe(
          map(experiment => ProjectFederatedExperimentsActions.startExperimentSuccess({projectId, experiment})),
          catchError(error => of(ProjectFederatedExperimentsActions.startExperimentFailure({
            projectId,
            experimentId,
            error
          })))
        )
      )
    )
  });

  stopFederatedExperiment$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(ProjectFederatedExperimentsActions.stopExperiment),
      switchMap(({projectId, experimentId}) =>
        this.api.stopFederatedExperiment(projectId, experimentId).pipe(
          map(experiment => ProjectFederatedExperimentsActions.stopExperimentSuccess({projectId, experiment})),
          catchError(error => of(ProjectFederatedExperimentsActions.stopExperimentFailure({
            projectId,
            experimentId,
            error
          })))
        )
      )
    )
  });

  loadExperiment$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(ProjectFederatedExperimentsActions.loadExperiment),
      switchMap(({projectId, id}) => {
        const stop$ = this.actions$.pipe(
          ofType(ProjectFederatedExperimentsActions.liveDisconnected),
        );
        const stream$ = this.api.streamExperimentFederated(projectId, id).pipe(
          map(payload => ProjectFederatedExperimentsActions.loadExperimentSuccess({experiment: payload})),
          takeUntil(stop$),
          catchError(error =>
            of(ProjectFederatedExperimentsActions.loadExperimentError({projectId, id, error}))
          )
        );
        const connected$ = of(ProjectFederatedExperimentsActions.liveConnected({
          projectId,
          experimentId: id
        }));
        return merge(connected$, stream$);
      })
    )
  });

  reconnectOnDisconnect$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(ProjectFederatedExperimentsActions.liveDisconnected),
      mergeMap(({projectId, experimentId}) =>
        of(ProjectFederatedExperimentsActions.loadExperiment({projectId, id: experimentId})
        ))
    )
  });

  loadFederatedStepDetail$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(ProjectFederatedExperimentsActions.loadStepDetail),
      switchMap(({projectId, experimentId, stepId}) =>
        this.api.getFederatedStepDetailUpdates(projectId, experimentId, stepId).pipe(
          map(detail => ProjectFederatedExperimentsActions.loadStepDetailSuccess({
            detail,
            projectId,
            experimentId,
            stepId,
          })),
          catchError(error => of(ProjectFederatedExperimentsActions.loadStepDetailError({
            projectId,
            experimentId,
            stepId,
            error
          })))
        )
      )
    )
  });

  loadFederatedStepMessages$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(ProjectFederatedExperimentsActions.loadStepMessages),
      switchMap(({projectId, experimentId, stepId}) =>
        this.api.streamLocalLogMessages(projectId, experimentId, stepId).pipe(
          map(message => ProjectFederatedExperimentsActions.loadStepMessagesSuccess({
            projectId,
            experimentId,
            stepId,
            message
          })),
          catchError(error => of(ProjectFederatedExperimentsActions.loadStepMessagesError({
            projectId,
            experimentId,
            stepId,
            error
          })))
        )
      )
    )
  });

  selectFederatedStep$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(ProjectFederatedExperimentsActions.selectStep),
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
        return of(ProjectFederatedExperimentsActions.loadStepDetail({projectId, experimentId, stepId: step.id}));
      })
    )
  });

  selectFederatedStepMessages$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(ProjectFederatedExperimentsActions.selectStep),
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
        return of(ProjectFederatedExperimentsActions.loadStepMessages({projectId, experimentId, stepId: step.id}));
      })
    )
  });
}
