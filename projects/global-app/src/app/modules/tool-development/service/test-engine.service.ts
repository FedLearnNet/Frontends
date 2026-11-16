import {inject, Injectable} from "@angular/core";
import {ApiService} from "@shared-lib/services/api.service";
import {catchError, map, Observable} from "rxjs";
import {SseClient} from "ngx-sse-client";
import {environment} from "@global-app/env/environment";
import {ApiErrorSnackbarService} from "@shared-lib/services/api-error-snackbar.service";
import {TestEngineCreateDTO} from "../dto/test-engine";
import {TestRunDTO} from "../dto/test-run";

@Injectable({
  providedIn: 'root'
})
export class TestEngineService {
  private readonly apiService: ApiService = inject(ApiService);
  private readonly errorSnackbarService: ApiErrorSnackbarService = inject(ApiErrorSnackbarService);
  private readonly sseClient: SseClient = inject(SseClient);
  private readonly apiUrl = environment.globalLearningApiUrl;

  public list(appId: number): Observable<TestRunDTO[]> {
    return this.apiService.get<TestRunDTO[]>(this.baseUrl(appId)).pipe(
      catchError(err => this.errorSnackbarService.showSnackBar(err, 'Failed to load the test engines')));
  }

  public start(appId: number, create: TestEngineCreateDTO): Observable<TestRunDTO> {
    return this.apiService.post<TestRunDTO>(this.baseUrl(appId), create).pipe(
      catchError(err => this.errorSnackbarService.showSnackBar(err, 'Failed to start the test engine')));
  }

  public stop(appId: number, id: number): Observable<TestRunDTO> {
    return this.apiService.post<TestRunDTO>(`${this.baseUrl(appId)}/${id}/stop`, {}).pipe(
      catchError(err => this.errorSnackbarService.showSnackBar(err, 'Failed to stop the test engine')));
  }

  public stream(appId: number): Observable<TestRunDTO> {
    return this.sseClient.stream(`${this.baseUrl(appId)}/stream`, {keepAlive: false, responseType: 'event'}).pipe(
      map((event: Event) => {
        if (event.type === 'error') {
          throw new Error('SSE connection error');
        }
        return JSON.parse((event as MessageEvent).data) as TestRunDTO;
      }),
    );
  }

  public logs(appId: number, id: number): Observable<string[]> {
    return this.apiService.get<string[]>(`${this.baseUrl(appId)}/${id}/logs`).pipe(
      catchError(err => this.errorSnackbarService.showSnackBar(err, 'Failed to load the test engine logs')));
  }

  private baseUrl(appId: number): string {
    return `${this.apiUrl}/runs/test-engine/${appId}`;
  }
}
