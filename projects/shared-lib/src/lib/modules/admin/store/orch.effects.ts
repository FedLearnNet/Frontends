import {inject, Injectable} from '@angular/core';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import {catchError, endWith, filter, map, mergeMap, of, switchMap, takeUntil} from 'rxjs';
import {OrchActions} from './orch.actions';
import {OrchRelayService} from '@shared-lib/modules/admin/services/orch.service';

@Injectable()
export class OrchEffects {
  private readonly actions$ = inject(Actions);
  private readonly api: OrchRelayService = inject(OrchRelayService);

  loadDashboard$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(OrchActions.loadDashboard),
      switchMap(() => of(
        OrchActions.loadDockerInfo(),
        OrchActions.loadRunningContainers(),
        OrchActions.loadRuns(),
        OrchActions.loadVolumes(),
        OrchActions.loadFcContainers(),
      ))
    );
  });

  loadDockerInfo$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(OrchActions.loadDockerInfo),
      switchMap(() =>
        this.api.getDockerInfo().pipe(
          map((info) => OrchActions.loadDockerInfoSuccess({info})),
          catchError((error) => of(OrchActions.loadDockerInfoFailure({error})))
        )
      )
    );
  });

  loadRunningContainers$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(OrchActions.loadRunningContainers),
      switchMap(() =>
        this.api.listRunning().pipe(
          map((containers) => OrchActions.loadRunningContainersSuccess({containers})),
          catchError((error) => of(OrchActions.loadRunningContainersFailure({error})))
        )
      )
    );
  });

  loadRunningContainer$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(OrchActions.loadRunningContainer),
      switchMap(({id}) =>
        this.api.getRunningById(id).pipe(
          map((container) => OrchActions.loadRunningContainerSuccess({container})),
          catchError((error) => of(OrchActions.loadRunningContainerFailure({id, error})))
        )
      )
    );
  });

  streamRunningLogs$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(OrchActions.streamRunningLogs),
      switchMap(({id}) =>
        this.api.streamRunningLogs(id).pipe(
          map((message) => OrchActions.streamRunningLogsMessage({id, message})),
          takeUntil(
            this.actions$.pipe(
              ofType(OrchActions.stopRunningLogsStream),
              filter((action) => action.id === id)
            )
          ),
          endWith(OrchActions.streamRunningLogsComplete({id})),
          catchError((error) => of(OrchActions.streamRunningLogsFailure({id, error})))
        )
      )
    );
  });

  loadRuns$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(OrchActions.loadRuns),
      switchMap(() =>
        this.api.listRuns().pipe(
          map((runs) => OrchActions.loadRunsSuccess({runs})),
          catchError((error) => of(OrchActions.loadRunsFailure({error})))
        )
      )
    );
  });

  loadRun$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(OrchActions.loadRun),
      switchMap(({id}) =>
        this.api.getRun(id).pipe(
          map((run) => OrchActions.loadRunSuccess({run})),
          catchError((error) => of(OrchActions.loadRunFailure({id, error})))
        )
      )
    );
  });

  loadRunDetail$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(OrchActions.loadRunDetail),
      switchMap(({id}) => of(
        OrchActions.loadRun({id}),
        OrchActions.loadRunLogs({id}),
      ))
    );
  });

  loadRunLogs$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(OrchActions.loadRunLogs),
      switchMap(({id}) =>
        this.api.getRunLogs(id).pipe(
          map((logs) => OrchActions.loadRunLogsSuccess({id, logs})),
          catchError((error) => of(OrchActions.loadRunLogsFailure({id, error})))
        )
      )
    );
  });

  loadVolumes$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(OrchActions.loadVolumes),
      switchMap(() =>
        this.api.listVolumes().pipe(
          map((volumes) => OrchActions.loadVolumesSuccess({volumes})),
          catchError((error) => of(OrchActions.loadVolumesFailure({error})))
        )
      )
    );
  });

  loadVolume$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(OrchActions.loadVolume),
      switchMap(({name}) =>
        this.api.getVolume(name).pipe(
          map((volume) => OrchActions.loadVolumeSuccess({volume})),
          catchError((error) => of(OrchActions.loadVolumeFailure({name, error})))
        )
      )
    );
  });

  removeVolume$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(OrchActions.removeVolume),
      switchMap(({name}) =>
        this.api.removeVolume(name).pipe(
          map(() => OrchActions.removeVolumeSuccess({name})),
          catchError((error) => of(OrchActions.removeVolumeFailure({name, error})))
        )
      )
    );
  });

  loadFcContainers$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(OrchActions.loadFcContainers),
      switchMap(() =>
        this.api.listFeatureCloud().pipe(
          map((containers) => OrchActions.loadFcContainersSuccess({containers})),
          catchError((error) => of(OrchActions.loadFcContainersFailure({error})))
        )
      )
    );
  });

  cleanupFcContainers$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(OrchActions.cleanupFcContainers),
      switchMap(({containerIds, cleanup}) =>
        this.api.cleanupContainers(containerIds, cleanup).pipe(
          mergeMap(() => of(
            OrchActions.cleanupFcContainersSuccess({containerIds}),
            OrchActions.loadFcContainers(),
            OrchActions.loadRunningContainers(),
          )),
          catchError((error) => of(OrchActions.cleanupFcContainersFailure({error})))
        )
      )
    );
  });
}
