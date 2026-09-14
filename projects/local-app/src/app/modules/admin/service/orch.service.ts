import {inject, Injectable} from '@angular/core';
import {HttpHeaders} from '@angular/common/http';
import {catchError, map, Observable} from 'rxjs';

import {environment} from '@local-app/env/environment';
import {ApiService} from "@shared-lib/services/api.service";
import {ContainerDTO, ContainerLogDTO, ContainerRunDTO, InfoDTO, InspectVolumeResponseDTO} from "@shared-lib/modules/admin/dto/orch";
import {TranslateService} from "@ngx-translate/core";
import {ApiErrorSnackbarService} from "@shared-lib/services/api-error-snackbar.service";
import {SseClient} from 'ngx-sse-client';
import {SKIP_LOADING} from '@shared-lib/interceptors/loading.interceptor';

@Injectable({
  providedIn: 'root'
})
export class OrchRelayService {
  private readonly apiService = inject(ApiService);
  private readonly sseClient: SseClient = inject(SseClient);
  private readonly errorSnackbarService = inject(ApiErrorSnackbarService);
  private readonly translate = inject(TranslateService);

  private readonly apiUrl = environment.localLearningAPIURL;
  private readonly path = 'admin/orch/relay';

  // ---- Docker ----
  getDockerInfo(): Observable<InfoDTO> {
    return this.apiService
      .get<InfoDTO>(`${this.baseUrl()}/docker/info`)
      .pipe(
        catchError(err =>
          this.errorSnackbarService.showSnackBar(
            err,
            this.translate.instant('ERROR.FAILED_TO_FETCH', {
              name: this.translate.instant('GRID.DOCKER_INFO').toLowerCase()
            })
          )
        )
      );
  }

  // ---- Running Containers ----
  listRunning(): Observable<ContainerDTO[]> {
    return this.apiService
      .get<ContainerDTO[]>(`${this.baseUrl()}/container/running`)
      .pipe(
        catchError(err =>
          this.errorSnackbarService.showSnackBar(
            err,
            this.translate.instant('ERROR.FAILED_TO_FETCH', {
              name: this.translate.instant('GRID.RUNNING_CONTAINERS').toLowerCase()
            })
          )
        )
      );
  }

  getRunningById(id: string): Observable<ContainerDTO> {
    return this.apiService
      .get<ContainerDTO>(`${this.baseUrl()}/container/running/${encodeURIComponent(id)}`)
      .pipe(
        catchError(err =>
          this.errorSnackbarService.showSnackBar(
            err,
            this.translate.instant('ERROR.FAILED_TO_FETCH', {
              name: this.translate.instant('GRID.CONTAINER').toLowerCase()
            })
          )
        )
      );
  }

  streamRunningLogs(id: string): Observable<string> {
    const url = `${this.baseUrl()}/container/running/${encodeURIComponent(id)}/logs/stream`;
    const headers = new HttpHeaders().set(SKIP_LOADING, 'true');

    return this.sseClient
      .stream(
        url,
        {keepAlive: false, responseType: 'event'},
        {headers},
        'GET'
      )
      .pipe(
        map((event: Event) => {
          if (event.type === 'error') {
            const errorEvent = event as ErrorEvent;
            throw errorEvent.error ?? new Error(errorEvent.message || 'SSE connection error');
          }

          const messageEvent = event as MessageEvent;
          return typeof messageEvent.data === 'string'
            ? messageEvent.data
            : JSON.stringify(messageEvent.data);
        }),
        catchError(err =>
          this.errorSnackbarService.showSnackBar(
            err,
            this.translate.instant('ERROR.FAILED_TO_FETCH', {
              name: this.translate.instant('GRID.CONTAINER_LOGS').toLowerCase()
            })
          )
        )
      );
  }

  // ---- Runs ----
  listRuns(): Observable<ContainerRunDTO[]> {
    return this.apiService
      .get<ContainerRunDTO[]>(`${this.baseUrl()}/container/run`)
      .pipe(
        catchError(err =>
          this.errorSnackbarService.showSnackBar(
            err,
            this.translate.instant('ERROR.FAILED_TO_FETCH', {
              name: this.translate.instant('GRID.RUNS').toLowerCase()
            })
          )
        )
      );
  }

  getRun(id: number): Observable<ContainerRunDTO> {
    return this.apiService
      .get<ContainerRunDTO>(`${this.baseUrl()}/container/run/${id}`)
      .pipe(
        catchError(err =>
          this.errorSnackbarService.showSnackBar(
            err,
            this.translate.instant('ERROR.FAILED_TO_FETCH', {
              name: this.translate.instant('GRID.RUN').toLowerCase()
            })
          )
        )
      );
  }

  getRunLogs(id: number): Observable<ContainerLogDTO[]> {
    return this.apiService
      .get<ContainerLogDTO[]>(`${this.baseUrl()}/container/run/${id}/logs`)
      .pipe(
        catchError(err =>
          this.errorSnackbarService.showSnackBar(
            err,
            this.translate.instant('ERROR.FAILED_TO_FETCH', {
              name: this.translate.instant('GRID.RUN_LOGS').toLowerCase()
            })
          )
        )
      );
  }

  // ---- Volumes ----
  listVolumes(): Observable<InspectVolumeResponseDTO[]> {
    return this.apiService
      .get<InspectVolumeResponseDTO[]>(`${this.baseUrl()}/volume`)
      .pipe(
        catchError(err =>
          this.errorSnackbarService.showSnackBar(
            err,
            this.translate.instant('ERROR.FAILED_TO_FETCH', {
              name: this.translate.instant('GRID.VOLUMES').toLowerCase()
            })
          )
        )
      );
  }

  getVolume(name: string): Observable<InspectVolumeResponseDTO> {
    return this.apiService
      .get<InspectVolumeResponseDTO>(`${this.baseUrl()}/volume/${encodeURIComponent(name)}`)
      .pipe(
        catchError(err =>
          this.errorSnackbarService.showSnackBar(
            err,
            this.translate.instant('ERROR.FAILED_TO_FETCH', {
              name: this.translate.instant('GRID.VOLUME').toLowerCase()
            })
          )
        )
      );
  }

  volumeWorkflowDownloadHref(workflowId: number, appId: number, workflowStep: number): string {
    return `${this.baseUrl()}/volume/workflow/${workflowId}/app/${appId}/step/${workflowStep}/download`;
  }

  private baseUrl(): string {
    return `${this.apiUrl}/${this.path}`;
  }
}
