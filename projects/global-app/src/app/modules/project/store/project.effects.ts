import {inject, Injectable} from '@angular/core';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import {catchError, filter, map, mergeMap, of, switchMap} from 'rxjs';
import {ProjectService} from "@global-app/project/services/project-service";
import {ProjectActions} from "@global-app/project/store/project.actions";
import {UploadProgress} from "@shared-lib/modules/files/model/file-response";
import {ProjectDetailDto} from "@global-app/project/dto/project";

@Injectable()
export class ProjectEffects {
  private readonly actions$ = inject(Actions);
  private readonly api = inject(ProjectService);

  loadList$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(ProjectActions.loadList),
      switchMap(() =>
        this.api.getProjects().pipe(
          map(items => ProjectActions.loadListSuccess({items})),
          catchError(error => of(ProjectActions.loadListFailure({error})))
        )
      )
    );
  });

  load$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(ProjectActions.load),
      switchMap(({id}) =>
        this.api.getProject(id).pipe(
          map(project => ProjectActions.loadSuccess({project})),
          catchError(error => of(ProjectActions.loadFailure({id, error})))
        )
      )
    );
  });

  create$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(ProjectActions.create),
      switchMap(({dto}) =>
        this.api.createProject(dto).pipe(
          map(project => ProjectActions.createSuccess({project})),
          catchError(error => of(ProjectActions.createFailure({error})))
        )
      )
    );
  });

  update$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(ProjectActions.update),
      switchMap(({project}) =>
        this.api.updateProject(project).pipe(
          map(updated => ProjectActions.updateSuccess({project: updated})),
          catchError(error => of(ProjectActions.updateFailure({error})))
        )
      )
    );
  });

  delete$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(ProjectActions.delete),
      switchMap(({id}) =>
        this.api.deleteProject(id).pipe(
          map(() => ProjectActions.deleteSuccess({id})),
          catchError(error => of(ProjectActions.deleteFailure({id, error})))
        )
      )
    );
  });

  uploadFile$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(ProjectActions.uploadFile),
      mergeMap(({projectId, file}) =>
        this.api.upload(projectId, file).pipe(
          filter((u: UploadProgress<ProjectDetailDto>) => !!u.result),
          map(({result}) => ProjectActions.uploadFileSuccess({projectId, project: result!})),
          catchError((error) => of(ProjectActions.uploadFileFailure({projectId, error})))
        )
      )
    );
  });
}
