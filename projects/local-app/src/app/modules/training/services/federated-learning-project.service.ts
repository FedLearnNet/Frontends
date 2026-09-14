import {inject, Injectable} from '@angular/core';
import {catchError, map, Observable, takeWhile} from 'rxjs';
import {ApiService} from '@shared-lib/services/api.service';

import {environment} from '@local-app/env/environment';
import {PaginatedResponse} from "@shared-lib/models";
import {HttpHeaders, HttpParams} from "@angular/common/http";
import {FederatedLearningProjectDto} from "../dto/federated-learning-project";
import {ApiErrorSnackbarService} from "@shared-lib/services/api-error-snackbar.service";
import {TranslateService} from "@ngx-translate/core";
import {SseClient} from "ngx-sse-client";
import {SKIP_LOADING} from "@shared-lib/interceptors/loading.interceptor";
import {ProjectStatus} from "@global-app/project/dto/project";
import {RunMessageLogDTO} from "@shared-lib/modules/experiments/dto/log";
import {FederatedLearningExperimentStepDetailDTO} from "../dto/federated-learming-steps";

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

  streamFederatedLearningProjectDetail(projectId: number): Observable<FederatedLearningProjectDto> {
    const url = `${this.getBaseUrl()}/${projectId}/stream`;
    const headers = new HttpHeaders().set(SKIP_LOADING, 'true');

    return this.sseClient.stream(
      url,
      {keepAlive: true, responseType: 'event'},
      {headers},
      'GET'
    ).pipe(
      map((event: Event) => {
        if ((event as any).type === 'error') {
          const err = event as ErrorEvent;
          console.error(err.error, err.message);
          throw new Error('SSE connection error');
        }
        const me = event as MessageEvent;
        return JSON.parse(me.data) as FederatedLearningProjectDto;
      }),
      takeWhile((p) => {
        const status = (p as any).status ?? (p as any).experimentStatus;
        return String(status).toUpperCase() !== ProjectStatus.FINISHED;
      }, true)
    );
  }

  streamAllStartedFederatedLearningProjects(page?: number, pageSize?: number): Observable<FederatedLearningProjectDto> {
    const base = this.getBaseUrl();
    const urlObj = new URL(`${base}/stream`, window.location.origin);

    if (page) urlObj.searchParams.set('page', String(page));
    if (pageSize) urlObj.searchParams.set('page_size', String(pageSize));

    const headers = new HttpHeaders().set(SKIP_LOADING, 'true');

    return this.sseClient.stream(
      urlObj.toString(),
      {keepAlive: true, responseType: 'event'},
      {headers},
      'GET'
    ).pipe(
      map((event: Event) => {
        if ((event as any).type === 'error') {
          const err = event as ErrorEvent;
          console.error(err.error, err.message);
          throw new Error('SSE connection error');
        }
        const me = event as MessageEvent;
        return JSON.parse(me.data) as FederatedLearningProjectDto;
      }));
  }

  public streamLogMessages(experimentId: number, stepId: number): Observable<RunMessageLogDTO> {
    const base = this.getBaseUrl();

    const url = `${base}/${experimentId}/step/${stepId}/messages`;
    const headers = new HttpHeaders().set(SKIP_LOADING, 'true');
    return this.sseClient.stream(
      url,
      {keepAlive: true, responseType: 'event'},
      {headers},
      'GET'
    ).pipe(
      map(event => {
        if (event.type === 'error') {
          const errorEvent = event as ErrorEvent;
          console.error(errorEvent.error, errorEvent.message);
          throw new Error('SSE connection error');
        }
        const messageEvent = event as MessageEvent;
        return JSON.parse(messageEvent.data) as RunMessageLogDTO;
      })
    );
  }

  public getStepDetailUpdates(experimentId: number, stepId: number): Observable<FederatedLearningExperimentStepDetailDTO> {
    const base = this.getBaseUrl();
    return this.apiService.get<FederatedLearningExperimentStepDetailDTO>(`${base}/${experimentId}/step/${stepId}`)
      .pipe(
        catchError((err) => this.errorSnackbarService.showSnackBar(err,
          this.translate.instant('ERROR.FAILED_TO_FETCH', {name: this.translate.instant('GRID.LOCAL_STEP_DETAIL_UPDATES').toLowerCase()}))),
      );
  }

  private getBaseUrl(): string {
    return `${this.apiUrl}/${this.path}`;
  }
}
