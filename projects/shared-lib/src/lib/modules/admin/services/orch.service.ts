import {inject, Injectable} from '@angular/core';
import {HttpHeaders, HttpParams} from '@angular/common/http';
import {map, Observable} from 'rxjs';
import {TranslateService} from '@ngx-translate/core';
import {environment as e2} from '@global-app/env/environment';
import {environment as e1} from '@local-app/env/environment';
import {catchError} from 'rxjs/operators';
import {ApiErrorSnackbarService} from "@shared-lib/services/api-error-snackbar.service";
import {
  ContainerDTO,
  ContainerLogDTO,
  ContainerRunDTO,
  InfoDTO,
  InspectVolumeResponseDTO
} from "../dto/orch";
import {ApiService} from "@shared-lib/services/api.service";
import {SseClient} from 'ngx-sse-client';
import {SKIP_LOADING} from '@shared-lib/interceptors/loading.interceptor';

@Injectable({providedIn: 'root'})
export class OrchRelayService {
  private readonly apiService = inject(ApiService);
  private readonly sseClient: SseClient = inject(SseClient);
  private readonly translate: TranslateService = inject(TranslateService);
  private readonly errorSnackbarService: ApiErrorSnackbarService = inject(ApiErrorSnackbarService);

  private readonly globalApiURL = e2.globalLearningApiUrl;
  private readonly localApiURL = e1.localLearningAPIURL;

  private readonly path = 'admin/orch/relay';

  private baseUrl(): string {
    if (this.localApiURL) {
      return `${this.localApiURL}/${this.path}`;
    }
    return `${this.globalApiURL}/${this.path}`;
  }

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

  removeVolume(name: string): Observable<void> {
    return this.apiService
      .delete<void>(`${this.baseUrl()}/volume/${encodeURIComponent(name)}`)
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

  listFeatureCloud(): Observable<ContainerDTO[]> {
    return this.apiService
      .get<ContainerDTO[]>(`${this.baseUrl()}/container/fc`)
      .pipe(
        catchError(err =>
          this.errorSnackbarService.showSnackBar(
            err,
            this.translate.instant('ERROR.FAILED_TO_FETCH', {
              name: 'tool containers'
            })
          )
        )
      );
  }

  cleanupContainers(containerIds: string[], cleanup: boolean): Observable<void> {
    const params = new HttpParams().set('cleanup', String(cleanup));
    return this.apiService
      .deleteWithBody<void>(`${this.baseUrl()}/container/fc`, containerIds, undefined, params)
      .pipe(
        catchError(err =>
          this.errorSnackbarService.showSnackBar(
            err,
            this.translate.instant('ERROR.FAILED_TO_FETCH', {
              name: 'container cleanup'
            })
          )
        )
      );
  }
}
