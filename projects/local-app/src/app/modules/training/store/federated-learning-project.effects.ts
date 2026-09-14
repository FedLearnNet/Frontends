import {inject, Injectable} from '@angular/core';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import {concatLatestFrom} from '@ngrx/operators';
import {FederatedLearningProjectActions} from './federated-learning-project.actions';
import {catchError, EMPTY, map, merge, mergeMap, of, switchMap, takeUntil} from 'rxjs';
import {FederatedLearningProjectService} from "../services/federated-learning-project.service";
import {Store} from "@ngrx/store";
import {selectSelectedDetail} from "./federated-learning-project.selectors";

@Injectable()
export class FederatedLearningProjectEffects {
  private readonly actions$ = inject(Actions);
  private readonly api = inject(FederatedLearningProjectService);
  private readonly store = inject(Store);

  loadList$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(FederatedLearningProjectActions.loadList),
      switchMap(({page, pageSize}) =>
        this.api.getAllStartedFederatedLearningProjects(page, pageSize).pipe(
          map(resp =>
            FederatedLearningProjectActions.loadListSuccess({
              items: resp.results ?? resp.results ?? [],
              page: resp.page ?? page ?? 1,
              pageSize: resp.pageSize ?? pageSize ?? 10,
              total: resp.totalCount ?? 0,
            })
          ),
          catchError(error => of(FederatedLearningProjectActions.loadListFailure({error})))
        )
      )
    )
  });

  loadDetail$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(FederatedLearningProjectActions.loadDetail),
      switchMap(({id}) =>
        this.api.getFederatedLearningProjectDetail(id).pipe(
          map(detail => FederatedLearningProjectActions.loadDetailSuccess({detail})),
          catchError(error => of(FederatedLearningProjectActions.loadDetailFailure({id, error})))
        )
      )
    )
  });

  openLiveList$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(FederatedLearningProjectActions.openLiveList),
      switchMap(({page, pageSize}) => {
        const stop$ = this.actions$.pipe(ofType(FederatedLearningProjectActions.closeLiveList));
        const connected$ = of(FederatedLearningProjectActions.liveConnected({channel: 'list'}));
        const stream$ = this.api.streamAllStartedFederatedLearningProjects(page, pageSize).pipe(
          map(payload => FederatedLearningProjectActions.liveEvent({payload})),
          takeUntil(stop$),
          catchError(error => of(FederatedLearningProjectActions.liveError({channel: 'list', error})))
        );
        return merge(connected$, stream$);
      })
    )
  });

  reconnectListOnDisconnect$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(FederatedLearningProjectActions.liveDisconnected),
      mergeMap(({channel}) =>
        channel === 'list' ? of(FederatedLearningProjectActions.openLiveList({})) : of()
      )
    )
  });

  openLiveDetail$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(FederatedLearningProjectActions.openLiveDetail),
      switchMap(({id}) => {
        const stop$ = this.actions$.pipe(ofType(FederatedLearningProjectActions.closeLiveDetail));
        const connected$ = of(FederatedLearningProjectActions.liveConnected({channel: 'detail', id}));
        const stream$ = this.api.streamFederatedLearningProjectDetail(id).pipe(
          map(payload => FederatedLearningProjectActions.liveEvent({payload})),
          takeUntil(stop$),
          catchError(error => of(FederatedLearningProjectActions.liveError({channel: 'detail', id, error})))
        );
        return merge(connected$, stream$);
      })
    )
  });

  reconnectDetailOnDisconnect$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(FederatedLearningProjectActions.liveDisconnected),
      mergeMap(({channel, id}) =>
        channel === 'detail' && id != null ? of(FederatedLearningProjectActions.openLiveDetail({id})) : of()
      )
    )
  });

  loadLocalStepDetail$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(FederatedLearningProjectActions.loadStepDetail),
      switchMap(({experimentId, stepId}) =>
        this.api.getStepDetailUpdates(experimentId, stepId).pipe(
          map(detail => FederatedLearningProjectActions.loadStepDetailSuccess({
            experimentId,
            stepId,
            detail
          })),
          catchError(error => of(FederatedLearningProjectActions.loadStepDetailError({
            experimentId,
            stepId,
            error
          })))
        )
      )
    )
  });

  exportPatientData$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(FederatedLearningProjectActions.exportPatients),
      switchMap(({id}) =>
        this.api.downloadProjectData(id).pipe(
          map(el => {
            el.click();
            return FederatedLearningProjectActions.exportPatientsSuccess();
          }),
          catchError(error => of(FederatedLearningProjectActions.exportPatientsFailure({
            error
          })))
        )
      )
    )
  });


  loadLocalStepMessages$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(FederatedLearningProjectActions.loadStepMessages),
      switchMap(({experimentId, stepId}) =>
        this.api.streamLogMessages(experimentId, stepId).pipe(
          map(message => FederatedLearningProjectActions.loadStepMessagesSuccess({
            experimentId,
            stepId,
            message
          })),
          catchError(error => of(FederatedLearningProjectActions.loadStepMessagesError({
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
      ofType(FederatedLearningProjectActions.selectLocalStep),
      concatLatestFrom(() => this.store.select(selectSelectedDetail)),
      mergeMap(([{nodeId}, project]) => {
        if (!project) {
          return EMPTY;
        }

        const experimentId = project.experiment.id;
        const steps = Array.isArray(project.experiment.steps) ? project.experiment.steps : [];

        const step = steps.find((s: any) => s?.workflowNodeId === nodeId);
        if (!step) {
          return EMPTY;
        }
        return of(FederatedLearningProjectActions.loadStepDetail({experimentId, stepId: step.id}));
      })
    )
  });

  selectLocalStepMessages$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(FederatedLearningProjectActions.selectLocalStep),
      concatLatestFrom(() => this.store.select(selectSelectedDetail)),
      mergeMap(([{nodeId}, project]) => {
        if (!project) {
          return EMPTY;
        }

        const experimentId = project.experiment.id;
        const steps = Array.isArray(project.experiment.steps) ? project.experiment.steps : [];

        const step = steps.find((s: any) => s?.workflowNodeId === nodeId);
        if (!step) {
          return EMPTY;
        }
        return of(FederatedLearningProjectActions.loadStepMessages({experimentId, stepId: step.id}));
      })
    )
  });
}
