import {inject, Injectable} from '@angular/core';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import {Store} from '@ngrx/store';
import {concatLatestFrom} from '@ngrx/operators';
import {catchError, map, of, switchMap, takeUntil, tap} from 'rxjs';
import {TransformerAssistantStreamService} from '../../services/transformer-assistant-stream.service';
import {TransformerAssistantMessageType} from '../../dto/transformer-assistant';
import {TransformerAssistantActions} from './transformer-assistant.actions';
import {transformerAssistantFeature} from './transformer-assistant.reducer';

@Injectable()
export class TransformerAssistantEffects {

  private readonly actions$ = inject(Actions);
  private readonly stream = inject(TransformerAssistantStreamService);
  private readonly store = inject(Store);

  start$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(TransformerAssistantActions.start),
      switchMap(({connector, path}) => this.stream.connect(connector, path).pipe(
        map(message => TransformerAssistantActions.received({message})),
        // Followed after a stop as well, so the results found so far can still be applied
        takeUntil(this.actions$.pipe(ofType(TransformerAssistantActions.reset))),
        catchError((error: Error) => of(TransformerAssistantActions.connectionFailed({error: error.message}))),
      )),
    );
  });

  apply$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(TransformerAssistantActions.apply),
      concatLatestFrom(() => this.store.select(transformerAssistantFeature.selectNodesToApply)),
      tap(([, nodes]) => this.stream.send({
        type: TransformerAssistantMessageType.APPLY,
        schemaIds: nodes.map(node => node.schemaId),
      })),
    );
  }, {dispatch: false});

  stop$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(TransformerAssistantActions.stop),
      tap(() => this.stream.send({type: TransformerAssistantMessageType.STOP})),
    );
  }, {dispatch: false});

  sendMessage$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(TransformerAssistantActions.sendMessage),
      tap(({message, columns}) => this.stream.send({type: TransformerAssistantMessageType.USER_MESSAGE, message, columns})),
    );
  }, {dispatch: false});
}
