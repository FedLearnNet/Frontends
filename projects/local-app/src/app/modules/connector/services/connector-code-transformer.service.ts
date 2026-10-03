import {inject, Injectable} from '@angular/core';
import {HttpHeaders} from '@angular/common/http';
import {map, Observable} from 'rxjs';
import {SseClient} from 'ngx-sse-client';
import {ApiService} from '@shared-lib/services/api.service';
import {SKIP_LOADING} from '@shared-lib/interceptors/loading.interceptor';
import {environment} from '@local-app/env/environment';
import {
  CodeTransformerCheckDTO,
  CodeTransformerCheckResultDTO,
  CodeTransformerDTO,
  CodeTransformerLogDTO,
  CodeTransformerPipelineDTO,
  CodeTransformerRunnerDTO,
  CodeTransformerSaveDTO
} from '../dto/code-transformer';

@Injectable({providedIn: 'root'})
export class ConnectorCodeTransformerService {
  private readonly apiService: ApiService = inject(ApiService);
  private readonly sseClient: SseClient = inject(SseClient);
  private readonly url = `${environment.localLearningAPIURL}/connector/transformer/code`;
  private readonly headers = new HttpHeaders().set(SKIP_LOADING, 'true');

  startRunner(): Observable<CodeTransformerRunnerDTO> {
    return this.apiService.post<CodeTransformerRunnerDTO>(`${this.url}/runner`, {}, this.headers);
  }

  stopRunner(): Observable<CodeTransformerRunnerDTO> {
    return this.apiService.delete<CodeTransformerRunnerDTO>(`${this.url}/runner`, this.headers);
  }

  runnerLogs(): Observable<CodeTransformerLogDTO> {
    return this.stream<CodeTransformerLogDTO>(`${this.url}/runner/logs`);
  }

  check(request: CodeTransformerCheckDTO): Observable<CodeTransformerCheckResultDTO> {
    return this.apiService.post<CodeTransformerCheckResultDTO>(`${this.url}/check`, request, this.headers);
  }

  list(): Observable<CodeTransformerDTO[]> {
    return this.apiService.get<CodeTransformerDTO[]>(this.url, undefined, this.headers);
  }

  get(id: number): Observable<CodeTransformerDTO> {
    return this.apiService.get<CodeTransformerDTO>(`${this.url}/${id}`);
  }

  save(request: CodeTransformerSaveDTO): Observable<CodeTransformerDTO> {
    return this.apiService.post<CodeTransformerDTO>(this.url, request, this.headers);
  }

  delete(id: number): Observable<void> {
    return this.apiService.delete<void>(`${this.url}/${id}`);
  }

  build(id: number): Observable<CodeTransformerDTO> {
    return this.apiService.post<CodeTransformerDTO>(`${this.url}/${id}/build`, {}, this.headers);
  }

  buildUpdates(id: number): Observable<CodeTransformerPipelineDTO> {
    return this.stream<CodeTransformerPipelineDTO>(`${this.url}/${id}/build`);
  }

  private stream<T>(url: string): Observable<T> {
    return this.sseClient
      .stream(url, {keepAlive: false, responseType: 'event'}, {headers: this.headers}, 'GET')
      .pipe(map(event => {
        if (event.type === 'error') {
          throw (event as ErrorEvent).error ?? new Error('SSE connection error');
        }
        const data = (event as MessageEvent).data;
        return (typeof data === 'string' ? JSON.parse(data) : data) as T;
      }));
  }
}
