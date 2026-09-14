import {inject, Injectable} from '@angular/core';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import {of, tap} from 'rxjs';
import {catchError, map, switchMap} from 'rxjs/operators';

import * as WorkflowActions from './workflow.actions';
import {WorkflowService} from '@shared-lib/modules/workflow/store/workflow.service';
import {Router} from "@angular/router";

@Injectable()
export class WorkflowEffects {
  private readonly actions$ = inject(Actions);
  private readonly service = inject(WorkflowService);
  private readonly router: Router = inject(Router);


  listWorkflows$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(WorkflowActions.listWorkflows),
      switchMap(() =>
        this.service.listWorkflows().pipe(
          map((workflows) =>
            WorkflowActions.listWorkflowsSuccess({workflows})
          ),
          catchError((error) =>
            of(WorkflowActions.listWorkflowsFailure({error}))
          )
        )
      )
    );
  });

  listWorkflowForApp$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(WorkflowActions.listWorkflowForApp),
      switchMap(({appId}) =>
        this.service.listWorkflowForApp(appId).pipe(
          map((workflows) =>
            WorkflowActions.listWorkflowForAppSuccess({appId, workflows})
          ),
          catchError((error) =>
            of(WorkflowActions.listWorkflowForAppFailure({error}))
          )
        )
      )
    );
  });

  loadWorkflow$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(WorkflowActions.loadWorkflow),
      switchMap(({id}) =>
        this.service.retrieve(id).pipe(
          map((workflow) =>
            WorkflowActions.loadWorkflowSuccess({workflow})
          ),
          catchError((error) =>
            of(WorkflowActions.loadWorkflowFailure({error}))
          )
        )
      )
    )
  });

  createWorkflow$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(WorkflowActions.createWorkflow),
      switchMap(({createDTO}) =>
        this.service.create(createDTO).pipe(
          map((workflow) =>
            WorkflowActions.createWorkflowSuccess({workflow})
          ),
          catchError((error) =>
            of(WorkflowActions.createWorkflowFailure({error}))
          )
        )
      )
    )
  });

  createEmptyNextWorkflow$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(WorkflowActions.createNextEmptyWorkflow),
      switchMap(() =>
        this.service.createNextEmpty().pipe(
          map((workflow) =>
            WorkflowActions.createNextEmptyWorkflowSuccess({workflow})
          ),
          catchError((error) =>
            of(WorkflowActions.createNextEmptyWorkflowFailure({error}))
          )
        )
      )
    )
  });

  navigateOnCreateNextEmptyWorkflow$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(WorkflowActions.createNextEmptyWorkflowSuccess),
      tap(({workflow}) => {
        this.router.navigate(["workflow", workflow.id]);
      })
    );
  }, {dispatch: false});

  updateWorkflow$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(WorkflowActions.updateWorkflow),
      switchMap(({id, updateDTO}) =>
        this.service.update(id, updateDTO).pipe(
          map((workflow) =>
            WorkflowActions.updateWorkflowSuccess({workflow})
          ),
          catchError((error) =>
            of(WorkflowActions.updateWorkflowFailure({error}))
          )
        )
      )
    )
  });

  deleteWorkflow$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(WorkflowActions.deleteWorkflow),
      switchMap(({id}) =>
        this.service.delete(id).pipe(
          map(() =>
            WorkflowActions.deleteWorkflowSuccess({id})
          ),
          catchError((error) =>
            of(WorkflowActions.deleteWorkflowFailure({error}))
          )
        )
      )
    )
  });
}
