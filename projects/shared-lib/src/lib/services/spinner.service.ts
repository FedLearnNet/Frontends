import {Injectable} from '@angular/core';
import {BehaviorSubject, distinctUntilChanged, map, Observable, of, switchMap, timer} from 'rxjs';

/** Open requests below this duration never show the global spinner. */
export const SPINNER_SHOW_DELAY_MS = 300;

/** The global spinner: shown while any request is open, after a short delay, hidden once all ended. */
@Injectable({
  providedIn: 'root'
})
export class SpinnerService {
  // A count, not a flag: overlapping requests would turn a flag off while others still run.
  private readonly open$ = new BehaviorSubject(0);

  loadingObservable$: Observable<boolean> = this.open$.pipe(
    map(open => open > 0),
    distinctUntilChanged(),
    switchMap(loading => loading ? timer(SPINNER_SHOW_DELAY_MS).pipe(map(() => true)) : of(false)),
    distinctUntilChanged(),
  );

  start(): void {
    this.open$.next(this.open$.value + 1);
  }

  end(): void {
    this.open$.next(Math.max(0, this.open$.value - 1));
  }
}
