import {inject, Injectable} from '@angular/core';
import {catchError, map, Observable, takeWhile} from 'rxjs';
import {ApiService} from '@shared-lib/services/api.service';
import {environment} from '@local-app/env/environment';
import {PaginatedResponse} from "@shared-lib/models";
import {HttpHeaders, HttpParams} from "@angular/common/http";
import {FederatedLearningProjectDto, QueuedRunDto} from "../dto/federated-learning-project";
import {ExecutionRunDetailDTO} from "@shared-lib/modules/app-execution/dto/execution-run";
import {ApiErrorSnackbarService} from "@shared-lib/services/api-error-snackbar.service";
import {TranslateService} from "@ngx-translate/core";
import {SseClient} from "ngx-sse-client";
import {SKIP_LOADING} from "@shared-lib/interceptors/loading.interceptor";
import {isFinalStatus} from "@shared-lib/modules/app-execution/dto/execution-run";

@Injectable({
  providedIn: 'root'
})
export class FederatedLearningProjectService {
  private readonly errorSnackbarService: ApiErrorSnackbarService = inject(ApiErrorSnackbarService);
  private readonly apiService: ApiService = inject(ApiService);
  private readonly translate: TranslateService = inject(TranslateService);
  private readonly sseClient: SseClient = inject(SseClient);

  private readonly apiUrl = environment.localLearningAPIURL;
  private readonly path = 'learning/projects'

  getFederatedLearningProjectDetail(projectId: number): Observable<FederatedLearningProjectDto> {
    return this.apiService.get<FederatedLearningProjectDto>(`${this.getBaseUrl()}/${projectId}`)
      .pipe(
        catchError((err) => this.errorSnackbarService.showSnackBar(err,
          this.translate.instant('ERROR.FAILED_TO_FETCH', {name: this.translate.instant('GRID.APP').toLowerCase()})))
      );
  }

  downloadProjectData(projectId: number): Observable<HTMLAnchorElement> {
    return this.apiService.download(`${this.getBaseUrl()}/${projectId}/export`)
      .pipe(
        catchError((err) => this.errorSnackbarService.showSnackBar(err,
          this.translate.instant('ERROR.FAILED_TO_DOWNLOAD', {name: this.translate.instant('LABEL.FILE').toLowerCase()})))
      );
  }

  getAllStartedFederatedLearningProjects(page?: number, pageSize?: number): Observable<PaginatedResponse<FederatedLearningProjectDto>> {
    let queryParam = new HttpParams();
    if (page) {
      queryParam = queryParam.set('page', page);
    }
    if (pageSize) {
      queryParam = queryParam.set('page_size', pageSize);
    }
    return this.apiService.get<PaginatedResponse<FederatedLearningProjectDto>>(`${this.getBaseUrl()}`, queryParam)
      .pipe(
        catchError((err) => this.errorSnackbarService.showSnackBar(err,
          this.translate.instant('ERROR.FAILED_TO_FETCH', {name: this.translate.instant('GRID.ALL_TRAINING_REQUESTS').toLowerCase()})))
      );
  }

  /** This clinic's run of the training with the logs and metrics of its steps. */
  getRun(projectId: number): Observable<ExecutionRunDetailDTO> {
    return this.apiService.get<ExecutionRunDetailDTO>(`${this.getBaseUrl()}/${projectId}/run`)
      .pipe(
        catchError((err) => this.errorSnackbarService.showSnackBar(err,
          this.translate.instant('ERROR.FAILED_TO_FETCH', {name: this.translate.instant('GRID.LOCAL_STEP_DETAIL_UPDATES').toLowerCase()}))),
      );
  }

  /** This clinic's run of the training now and on every change after, until it ended. */
  followRun(projectId: number): Observable<ExecutionRunDetailDTO> {
    const headers = new HttpHeaders().set(SKIP_LOADING, 'true');
    return this.sseClient.stream(`${this.getBaseUrl()}/${projectId}/run/stream`, {keepAlive: true, responseType: 'event'}, {headers}, 'GET')
      .pipe(
        map((event: Event) => {
          if (event.type === 'error') {
            const err = event as ErrorEvent;
            console.error(err.error, err.message);
            throw new Error('SSE connection error');
          }
          return JSON.parse((event as MessageEvent).data) as ExecutionRunDetailDTO;
        }),
        takeWhile(run => !isFinalStatus(run.status), true)
      );
  }

  getQueue(): Observable<QueuedRunDto[]> {
    return this.apiService.get<QueuedRunDto[]>(`${this.getBaseUrl()}/queue`, undefined,
      new HttpHeaders().set(SKIP_LOADING, 'true'));
  }

  private getBaseUrl(): string {
    return `${this.apiUrl}/${this.path}`;
  }
}
