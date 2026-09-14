import {inject, Injectable} from '@angular/core';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import {map, switchMap} from 'rxjs/operators';
import {merge, Subject, takeUntil, tap} from 'rxjs';
import {WorkflowChatWebSocketService} from "@shared-lib/modules/workflow/service/workflow-chat.service";
import {WorkflowChatMessageDTO} from "@shared-lib/modules/workflow/dto/workflow-chat";
import {WorkflowChatActions} from "@shared-lib/modules/workflow/store/workflow-chat.actions";

@Injectable()
export class WorkflowChatEffects {
  private readonly actions$ = inject(Actions);
  private readonly ws: WorkflowChatWebSocketService = inject(WorkflowChatWebSocketService);

  connect$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(WorkflowChatActions.connect),
      tap(({workflowId}) => this.ws.connect(workflowId)),
      switchMap(() => {
        const stop$ = new Subject<void>();
        const opened$ = this.ws.opened().pipe(map(() => WorkflowChatActions.socketOpened()));
        const closed$ = this.ws.closed().pipe(map(() => WorkflowChatActions.socketClosed()));
        const errored$ = this.ws.errored().pipe(map(error => WorkflowChatActions.socketError({error})));

        const inbound$ = this.ws.messages().pipe(
          map((msg: WorkflowChatMessageDTO) =>
            WorkflowChatActions.addMessage({msg})
          )
        );

        return merge(opened$, closed$, errored$, inbound$).pipe(takeUntil(stop$));
      })
    );
  });

  sendUser$ = createEffect(() => {
      return this.actions$.pipe(
        ofType(WorkflowChatActions.sendUserMessage),
        map(({content}) => {
          const msg: WorkflowChatMessageDTO = {
            message: content,
            id: new Date().toISOString(),
            request: true,
            done: true,
            errorMessage: '',
            statusMessage: '',
            createdAt: new Date(),
          };
          this.ws.sendChatMessage(content);
          return WorkflowChatActions.addMessage({msg});
        })
      );
    }
  );
}
