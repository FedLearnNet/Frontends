import {inject, Injectable} from '@angular/core';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import {FederatedLearningProjectActions} from './federated-learning-project.actions';
import {catchError, concat, EMPTY, map, mergeMap, of, switchMap} from 'rxjs';
import {FederatedLearningProjectService} from "../services/federated-learning-project.service";
import {isFinalStatus} from "@shared-lib/modules/app-execution/dto/execution-run";

@Injectable()
export class FederatedLearningProjectEffects {
  private readonly actions$ = inject(Actions);
  private readonly api = inject(FederatedLearningProjectService);

  loadList$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(FederatedLearningProjectActions.loadList),
      switchMap(({page, pageSize}) => this.api.getAllStartedFederatedLearningProjects(page, pageSize).pipe(
        map(resp => FederatedLearningProjectActions.loadListSuccess({
          items: resp.results ?? [],
          page: resp.page ?? page ?? 1,
          pageSize: resp.pageSize ?? pageSize ?? 10,
          total: resp.totalCount ?? 0,
        })),
        catchError(error => of(FederatedLearningProjectActions.loadListFailure({error})))
      ))
    )
  });

  loadDetail$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(FederatedLearningProjectActions.loadDetail),
      switchMap(({id}) => this.api.getFederatedLearningProjectDetail(id).pipe(
        map(detail => FederatedLearningProjectActions.loadDetailSuccess({detail})),
        catchError(error => of(FederatedLearningProjectActions.loadDetailFailure({id, error})))
      ))
    )
  });

  // A run that still goes on is followed.
  followOnDetail$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(FederatedLearningProjectActions.loadDetailSuccess),
      mergeMap(({detail}) => detail.run && !isFinalStatus(detail.run.status)
        ? of(FederatedLearningProjectActions.followRun({id: detail.project.id}))
        : EMPTY)
    )
  });

  followRun$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(FederatedLearningProjectActions.followRun),
      switchMap(({id}) => concat(
        this.api.followRun(id).pipe(
          map(run => FederatedLearningProjectActions.runChanged({id, run})),
          catchError(error => of(FederatedLearningProjectActions.loadRunDetailFailure({error})))
        ),
        of(FederatedLearningProjectActions.followRunEnded())
      ))
    )
  });

  loadRunDetail$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(FederatedLearningProjectActions.loadRunDetail),
      switchMap(({id}) => this.api.getRun(id).pipe(
        map(run => FederatedLearningProjectActions.loadRunDetailSuccess({run})),
        catchError(error => of(FederatedLearningProjectActions.loadRunDetailFailure({error})))
      ))
    )
  });

  exportPatientData$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(FederatedLearningProjectActions.exportPatients),
      switchMap(({id}) => this.api.downloadProjectData(id).pipe(
        map(link => {
          link.click();
          return FederatedLearningProjectActions.exportPatientsSuccess();
        }),
        catchError(error => of(FederatedLearningProjectActions.exportPatientsFailure({error})))
      ))
    )
  });
}
