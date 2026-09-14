import {inject} from '@angular/core';
import {ResolveFn} from '@angular/router';
import {QueryConfig} from '@global-app/find-data/models';
import {QueryService} from '@global-app/find-data/services/query.service';
import {QueryBuilderService} from '@global-app/find-data/services/query-builder.service';
import {QueryDTO} from "@global-app/find-data/dto/query";
import {catchError, of} from "rxjs";

export const queryListResolver: ResolveFn<QueryDTO[]> = () => {
  return inject(QueryService)
    .getAllQueries()
    .pipe(
      catchError(() => of([]))  // Return an empty array on error, dont block on error routing
    );
}

export const queryConfigsResolver: ResolveFn<QueryConfig[]> = () => {
  return inject(QueryBuilderService).getQueryConfigs();
}

export const queryDetailResolver: ResolveFn<QueryDTO | null> = (route) => {
  const id = Number(route.paramMap.get('queryId'));
  if (!id) {
    return of(null);
  }

  return inject(QueryService)
    .get(id)
    .pipe(
      catchError(() => of(null))
    );
}
