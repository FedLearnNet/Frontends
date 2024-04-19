import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Application, Query, Workflow, WorkflowStatus } from '@global-app/find-data/models';
import { QUERIES } from '@global-app/find-data/services/mock';
import { generateRandomNumber } from '@shared-lib/utils';
import { APPLICATIONS } from '@global-app/find-data/services/mock/applications.mock';

@Injectable({
  providedIn: 'root'
})
export class QueryService {
  queryList: Query[] = [];

  constructor() { }

  getAllQueries(): Observable<Query[]> {
    this.checkQueryList();

    return of(this.queryList);
  }

  getQuery(queryId: number): Observable<Query> {
    this.checkQueryList();

    return of(this.queryList.find(query => query.id === queryId) as Query);
  }

  createQuery(queryData: Query): Observable<Query[]> {
    const nextQueryId = this.queryList.map(query => query.id).sort().pop() ?? 1;

    this.queryList.push({
      ...queryData,
      id: nextQueryId + 1,
      queryString: QueryService.getRandomQueryString(),
      workflows: [],
    });

    return of(this.queryList);
  }

  editQuery(queryData: Query): Observable<Query[]> {
    const queryIndex = this.queryList.findIndex(query => query.id === queryData.id);

    this.queryList[queryIndex] = {
      ...this.queryList[queryIndex],
      ...queryData,
    };

    return of(this.queryList);
  }

  runSpecificQuery(): Observable<{datasets: number, holders: number}> {
    return of({
      datasets: generateRandomNumber(1000, 10000),
      holders: generateRandomNumber(1, 10),
    });
  }

  runQuery(queryId: number): Observable<Query[]> {
    (this.queryList.find(queryItem => queryItem.id === queryId) as Query).result = {
      datasets: generateRandomNumber(1000, 10000),
      holders: generateRandomNumber(1, 10),
    };

    return of(this.queryList);
  }

  deleteQuery(queryId: number): Observable<Query[]> {
    this.queryList = this.queryList.filter(query => query.id !== queryId);

    return of(this.queryList);
  }

  getQueryWorkflows(queryId: number): Observable<Workflow[]> {
    this.checkQueryList();

    return of(this.queryList.find(query => query.id === queryId)?.workflows ?? []);
  }

  deleteQueryWorkflow(queryId: number, workflowId: number): Observable<Workflow[]> {
    const selectedQuery = this.queryList.find(query => query.id === queryId) as Query;
    selectedQuery.workflows = selectedQuery.workflows.filter(workflow => workflow.id !== workflowId);

    return of(this.queryList.find(query => query.id === queryId)?.workflows ?? []);
  }

  getQueryWorkflow(queryId: number, workflowId: number): Observable<Workflow> {
    this.checkQueryList();

    const selectedQuery = this.queryList.find(query => query.id === queryId) as Query;

    return of(selectedQuery.workflows.find(workflow => workflow.id === workflowId) as Workflow);
  }

  getWorkflowApplications(queryId: number, workflowId: number): Observable<Application[]> {
    this.checkQueryList();

    const selectedQuery = this.queryList.find(query => query.id === queryId) as Query;

    return of(selectedQuery.workflows.find(workflow => workflow.id === workflowId)?.applications ?? []);
  }

  getAllApplications(): Observable<Application[]> {
    return of(APPLICATIONS);
  }

  createNewWorkflow(queryId: number, workflow: Workflow): Observable<Workflow[]> {
    this.checkQueryList();

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
    this.checkQueryList();

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
    this.checkQueryList();

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

  private checkQueryList(): void {
    if (this.queryList.length === 0) {
      this.queryList = QUERIES;
    }
  }

  private static getRandomQueryString(): string {
    const mockQueryStrings = [
      '[Age] > 18 AND [Microbiome file] contains "test" AND [Age] < 30',
      '[Age] = 45 AND [Colorectal cancer] = true',
      '[Age] > 18 AND [Colorectal cancer] = false AND [Dietary score] > 1.1',
      '[Microbiome file] contains "test" AND [Colorectal cancer] = true AND [Dietary score] > 1.1',
      '[Age] > 18',
    ];

    return mockQueryStrings[generateRandomNumber(0, mockQueryStrings.length)];
  }
}
