import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, ResolveFn } from '@angular/router';
import { Query } from '@global-app/find-data/models';
import { QueryService } from '@global-app/find-data/services/query.service';

export const queryListResolver: ResolveFn<Query[]> = () => {
    return inject(QueryService).getAllQueries();
}

export const queryResolver: ResolveFn<Query> = (route: ActivatedRouteSnapshot) => {
    return inject(QueryService).getQuery(Number(route.paramMap.get('query-id')));
}

export const workflowStatusListResolver: ResolveFn<string[]> = () => {
    return inject(QueryService).getWorkflowStatuses();
}
