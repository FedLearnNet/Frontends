import {Observable} from 'rxjs';
import {Action, ActionCreator, Store} from '@ngrx/store';
import {Actions, ofType} from '@ngrx/effects';
import {take} from 'rxjs/operators';

/**
 * Dispatches an action and emits true when one of the success actions follows,
 * false when one of the failure actions follows.
 */
export function dispatchAndAwait(
  store: Store,
  actions$: Actions,
  action: Action,
  success: ActionCreator<string, any>[],
  failure: ActionCreator<string, any>[],
): Observable<boolean> {
  return new Observable<boolean>(subscriber => {
    const subscription = actions$.pipe(ofType(...success, ...failure), take(1)).subscribe(a => {
      subscriber.next(success.some(s => s.type === a.type));
      subscriber.complete();
    });
    store.dispatch(action);
    return () => subscription.unsubscribe();
  });
}
