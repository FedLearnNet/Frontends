import { Injectable } from '@angular/core';
import {
    catchError,
    expand,
    Observable,
    of,
    switchMap,
    takeWhile,
    throwError,
    timer
} from 'rxjs';
import {
    Application,
    Query,
    QueryResult,
    QueryResultResponse,
    Workflow,
    WorkflowStatus
} from '@global-app/find-data/models';
import { generateRandomNumber } from '@shared-lib/utils';
import { APPLICATIONS } from '@global-app/find-data/services/mock/applications.mock';
import { ApiService } from '@shared-lib/services/api.service';
import { environment } from '@global-app/env/environment';
import { filter, map } from 'rxjs/operators';
import { QueryResultStatus } from '@global-app/find-data/enums';

@Injectable({
    providedIn: 'root'
})
export class QueryService {
    private readonly apiUrl;
    private readonly path = 'query'

    constructor(
        private apiService: ApiService,
    ) {
        this.apiUrl = environment.queryControllerApiUrl;
    }

    getAllQueries(): Observable<QueryResultResponse> {
        return this.apiService.get<any>(this.getBaseUrl());
    }

    startQuery(queryString: string): Observable<any> {
        return this.apiService.post<any>(`${ this.getBaseUrl() }`, queryString);
    }

    getQueryResult(queryId: string): Observable<any> {
        return this.apiService.get<any>(`${ this.getBaseUrl() }?queryid=${ queryId }`);
    }

    pollQueryResult(queryId: string): Observable<QueryResult> {
        const pollDelay = 2500;

        return timer(pollDelay).pipe(
            expand((response: any) => {
                if (response.status !== QueryResultStatus.DONE) {
                    return timer(pollDelay).pipe(
                        switchMap(() => this.getQueryResult(queryId).pipe(
                            map(newResponse => this.getSpecificQueryResult(queryId, newResponse))
                        ))
                    );
                } else {
                    return throwError('Query completed');
                }
            }),
            filter(response => response.status === QueryResultStatus.DONE, true),
            takeWhile(response => response.status !== QueryResultStatus.DONE, true),
            catchError(error => {
                console.error('Polling error:', error);
                return throwError(error);
            })
        );
    }

    private getBaseUrl(): string {
        return `${ this.apiUrl }/${ this.path }`;
    }

    private getSpecificQueryResult(queryId: string, queryResponse: { queries: QueryResult[] }): QueryResult {
        return queryResponse.queries.find((result: any) => result.queryId === queryId) as QueryResult;
    }

    // @TODO Remove the following code block once all find-data related APIs are implemented.

    queryList: Query[] = [];

    deleteQuery(queryId: number): Observable<Query[]> {
        this.queryList = this.queryList.filter(query => query.id !== queryId);

        return of(this.queryList);
    }

    deleteQueryWorkflow(queryId: number, workflowId: number): Observable<Workflow[]> {
        const selectedQuery = this.queryList.find(query => query.id === queryId) as Query;
        selectedQuery.workflows = selectedQuery.workflows.filter(workflow => workflow.id !== workflowId);

        return of(this.queryList.find(query => query.id === queryId)?.workflows ?? []);
    }

    getWorkflowApplications(queryId: number, workflowId: number): Observable<Application[]> {
        const selectedQuery = this.queryList.find(query => query.id === queryId) as Query;

        return of(selectedQuery.workflows.find(workflow => workflow.id === workflowId)?.applications ?? []);
    }

    getAllApplications(): Observable<Application[]> {
        return of(APPLICATIONS);
    }

    createNewWorkflow(queryId: number, workflow: Workflow): Observable<Workflow[]> {
        const selectedQuery = this.queryList.find(query => query.id === queryId) as Query;
        selectedQuery.workflows.push({
            ...workflow,
            id: selectedQuery.workflows.length,
            applications: workflow.applications ?? [],
            status: WorkflowStatus.New,
            approved: {
                datasets: null,
                holders: null,
            },
        });

        return of(selectedQuery.workflows);
    }

    updateWorkflow(queryId: number, workflowData: Workflow): Observable<Workflow[]> {
        const selectedQuery = this.queryList.find(query => query.id === queryId) as Query;
        const selectedWorkflowIndex = selectedQuery.workflows.findIndex(workflow => workflow.id === workflowData.id);

        selectedQuery.workflows[selectedWorkflowIndex] = { ...workflowData };

        return of(selectedQuery.workflows);
    }

    getWorkflowStatuses(): Observable<string[]> {
        return of(
            Object.keys(WorkflowStatus)
                .map((key: any) => WorkflowStatus[key])
                .filter(value => typeof value === 'string') as string[]
        );
    }

    workflowRequestTraining(queryId: number, workflowId: number): Observable<Workflow> {
        const selectedQuery = this.queryList.find(query => query.id === queryId) as Query;
        const selectedWorkflowIndex = selectedQuery.workflows.findIndex(workflow => workflow.id === workflowId);

        selectedQuery.workflows[selectedWorkflowIndex] = {
            ...selectedQuery.workflows[selectedWorkflowIndex],
            status: WorkflowStatus.Pending,
            approved: {
                datasets: generateRandomNumber(1100, (selectedQuery.result.datasets ?? 10000) - 1000),
                holders: generateRandomNumber(2, (selectedQuery.result.holders ?? 1) - 1),
            },
        }

        return of(selectedQuery.workflows[selectedWorkflowIndex]);
    }
}
