import {inject, Injectable} from '@angular/core';
import {HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import {environment as e2} from '@global-app/env/environment';
import {environment as e1} from '@local-app/env/environment';
import {ApiService} from '@shared-lib/services/api.service';
import {PaginatedResponse} from '@shared-lib/models/paginated-response';
import {
  AdminExecutionAttemptDTO,
  AdminExecutionRunDTO,
  AdminExecutionStepDTO,
  ExecutionRunFilter,
  ExecutionRunSummaryDTO
} from '../dto/execution-admin';

@Injectable({providedIn: 'root'})
export class ExecutionAdminService {
  private readonly apiService = inject(ApiService);

  private readonly globalApiURL = e2.globalLearningApiUrl;
  private readonly localApiURL = e1.localLearningAPIURL;

  private readonly path = 'admin/executions';

  private baseUrl(): string {
    return `${this.localApiURL || this.globalApiURL}/${this.path}`;
  }

  listRuns(page: number, pageSize: number, filter: ExecutionRunFilter): Observable<PaginatedResponse<ExecutionRunSummaryDTO>> {
    let params = new HttpParams().set('page', page).set('page_size', pageSize);
    Object.entries(filter)
      .filter(([, value]) => !!value)
      .forEach(([key, value]) => params = params.set(key, value as string));
    return this.apiService.get<PaginatedResponse<ExecutionRunSummaryDTO>>(this.baseUrl(), params);
  }

  getRun(runId: number): Observable<AdminExecutionRunDTO> {
    return this.apiService.get<AdminExecutionRunDTO>(`${this.baseUrl()}/${runId}`);
  }

  getStep(runId: number, stepId: number): Observable<AdminExecutionStepDTO> {
    return this.apiService.get<AdminExecutionStepDTO>(`${this.baseUrl()}/${runId}/steps/${stepId}`);
  }

  getAttempt(runId: number, stepId: number, attemptId: number): Observable<AdminExecutionAttemptDTO> {
    return this.apiService.get<AdminExecutionAttemptDTO>(`${this.baseUrl()}/${runId}/steps/${stepId}/attempts/${attemptId}`);
  }
}
