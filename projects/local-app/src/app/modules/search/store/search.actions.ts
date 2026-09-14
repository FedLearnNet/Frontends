import {createActionGroup, emptyProps, props} from '@ngrx/store';
import {SearchResultDTO} from '../dto/search-result';

export const SearchActions = createActionGroup({
  source: 'Search',
  events: {
    'Search': props<{ query: string; limit?: number }>(),
    'Search Success': props<{ query: string; results: SearchResultDTO[] }>(),
    'Search Failure': props<{ error: any }>(),

    'Clear': emptyProps(),
  },
});
