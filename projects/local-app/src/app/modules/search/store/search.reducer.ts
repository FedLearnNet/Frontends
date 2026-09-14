import {createReducer, on} from '@ngrx/store';
import {SearchActions} from './search.actions';
import {SearchResultDTO} from '../dto/search-result';

export interface SearchState {
  query: string;
  results: SearchResultDTO[];
  loading: boolean;
  error: any;
}

export const initialSearchState: SearchState = {
  query: '',
  results: [],
  loading: false,
  error: null,
};

export const featureKey = 'search';

export const searchReducer = createReducer(
  initialSearchState,

  on(SearchActions.search, (state, {query}): SearchState => ({
    ...state, query, loading: true, error: null,
  })),
  on(SearchActions.searchSuccess, (state, {query, results}): SearchState => ({
    ...state, query, results, loading: false, error: null,
  })),
  on(SearchActions.searchFailure, (state, {error}): SearchState => ({
    ...state, results: [], loading: false, error,
  })),

  on(SearchActions.clear, (): SearchState => ({...initialSearchState})),
);
