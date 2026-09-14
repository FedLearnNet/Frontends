import {inject, Injectable} from '@angular/core';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import {catchError, map, of, switchMap} from 'rxjs';
import {SearchActions} from './search.actions';
import {SearchService} from '../services/search.service';

@Injectable()
export class SearchEffects {
  private readonly actions$ = inject(Actions);
  private readonly api = inject(SearchService);

  search$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(SearchActions.search),
      switchMap(({query, limit}) => this.api.search(query, limit).pipe(
        map(results => SearchActions.searchSuccess({query, results: results ?? []})),
        catchError(error => of(SearchActions.searchFailure({error})))
      ))
    )
  });
}
