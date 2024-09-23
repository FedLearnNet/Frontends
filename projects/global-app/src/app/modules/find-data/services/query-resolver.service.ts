import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { QueryConfig, QueryResultResponse } from '@global-app/find-data/models';
import { QueryService } from '@global-app/find-data/services/query.service';
import { QueryBuilderService } from '@global-app/find-data/services/query-builder.service';

export const queryListResolver: ResolveFn<QueryResultResponse> = () => {
    return inject(QueryService).getAllQueries();
}

export const queryConfigsResolver: ResolveFn<QueryConfig[]> = () => {
    return inject(QueryBuilderService).getQueryConfigs();
}
