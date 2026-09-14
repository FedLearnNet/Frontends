import {inject, Injectable} from "@angular/core";
import {ApiService} from "@shared-lib/services/api.service";
import {catchError, map, Observable, takeWhile, throwError} from "rxjs";
import {environment} from "@global-app/env/environment";
import {
  CreateProjectLocalExperimentDTO,
  ProjectFederatedCreateExperimentDTO,
  ProjectFederatedExperimentDetailDTO,
  ProjectFederatedExperimentDTO,
  ProjectFederatedExperimentStepDetailDTO,
  ProjectLocalExperimentDTO,
  ProjectLocalExperimentStepDetailDTO
} from "@global-app/project/dto/project-experiments";
import {TranslateService} from '@ngx-translate/core';
import {ApiErrorSnackbarService} from "@shared-lib/services/api-error-snackbar.service";
import {SseClient} from "ngx-sse-client";
import {HttpHeaders} from "@angular/common/http";
import {SKIP_LOADING} from "@shared-lib/interceptors/loading.interceptor";
import {ProjectStatus} from "@global-app/project/dto/project";
import {RunMessageLogDTO} from "@shared-lib/modules/experiments/dto/log";

@Injectable({
  providedIn: 'root'
})
export class ProjectExperimentService {
  private readonly apiUrl = environment.globalLearningApiUrl;
  private readonly path = 'project'
  private readonly apiService: ApiService = inject(ApiService);
  private readonly errorSnackbarService: ApiErrorSnackbarService = inject(ApiErrorSnackbarService);
  private readonly translate: TranslateService = inject(TranslateService);
  private readonly sseClient: SseClient = inject(SseClient);


  public getProjectFederatedExperiments(projectId: number): Observable<ProjectFederatedExperimentDTO[]> {
    return this.apiService.get<ProjectFederatedExperimentDTO[]>(`${this.getBaseUrl(projectId)}/federated`)
      .pipe(
        catchError((err) => {
          const errorMessage = JSON.stringify(err.error) || this.translate.instant('ERROR.FAILED_TO_FETCH', {name: this.translate.instant('GRID.PROJECTS').toLowerCase()});
          this.errorSnackbarService.showSnackBar(errorMessage, this.translate.instant('BUTTON.CLOSE'));
          return throwError(() => err);
        })
      );
  }

  public getProjectFederatedExperiment(projectId: number, experimentId: number): Observable<ProjectFederatedExperimentDetailDTO> {
    return this.apiService.get<ProjectFederatedExperimentDetailDTO>(`${this.getBaseUrl(projectId)}/federated/${experimentId}`)
      .pipe(
        catchError((err) => {
          const errorMessage = JSON.stringify(err.error) || this.translate.instant('ERROR.FAILED_TO_FETCH', {name: this.translate.instant('GRID.PROJECTS').toLowerCase()});
          this.errorSnackbarService.showSnackBar(errorMessage, this.translate.instant('BUTTON.CLOSE'));
          return throwError(() => err);
        })
      );
  }

  public createFederatedExperiment(projectId: number, experiment: ProjectFederatedCreateExperimentDTO): Observable<ProjectFederatedExperimentDetailDTO> {
    return this.apiService.post<ProjectFederatedExperimentDetailDTO>(`${this.getBaseUrl(projectId)}/federated`, experiment)
      .pipe(
        catchError((err) => {
          const errorMessage = JSON.stringify(err.error) || this.translate.instant('ERROR.FAILED_TO_CREATE', {name: this.translate.instant('GRID.PROJECT').toLowerCase()});
          this.errorSnackbarService.showSnackBar(errorMessage, this.translate.instant('BUTTON.CLOSE'));
          return throwError(() => err);
        })
      );
  }


  public startFederatedExperiment(projectId: number, experimentId: number): Observable<ProjectFederatedExperimentDetailDTO> {
    return this.apiService.putEmpty<ProjectFederatedExperimentDetailDTO>(`${this.getBaseUrl(projectId)}/federated/${experimentId}/start`)
      .pipe(
        catchError((err) => {
          const errorMessage = JSON.stringify(err.error) || this.translate.instant('ERROR.FAILED_TO_RUN', {name: this.translate.instant('GRID.PROJECT').toLowerCase()});
          this.errorSnackbarService.showSnackBar(errorMessage, this.translate.instant('BUTTON.CLOSE'));
          return throwError(() => err);
        })
      );
  }

  public stopFederatedExperiment(projectId: number, experimentId: number): Observable<ProjectFederatedExperimentDetailDTO> {
    return this.apiService.putEmpty<ProjectFederatedExperimentDetailDTO>(`${this.getBaseUrl(projectId)}/federated/${experimentId}/stop`)
      .pipe(
        catchError((err) => {
          const errorMessage = JSON.stringify(err.error) || this.translate.instant('ERROR.FAILED_TO_STOP', {name: this.translate.instant('GRID.PROJECT').toLowerCase()});
          this.errorSnackbarService.showSnackBar(errorMessage, this.translate.instant('BUTTON.CLOSE'));
          return throwError(() => err);
        })
      );
  }


  public getLocalFederatedExperiments(projectId: number): Observable<ProjectLocalExperimentDTO[]> {
    return this.apiService.get<ProjectLocalExperimentDTO[]>(`${this.getBaseUrl(projectId)}/local`)
      .pipe(
        catchError((err) => {
          const errorMessage = JSON.stringify(err.error) || this.translate.instant('ERROR.FAILED_TO_FETCH', {name: this.translate.instant('GRID.PROJECTS').toLowerCase()});
          this.errorSnackbarService.showSnackBar(errorMessage, this.translate.instant('BUTTON.CLOSE'));
          return throwError(() => err);
        })
      );
  }

  public createLocalExperiment(projectId: number, experiment: CreateProjectLocalExperimentDTO): Observable<ProjectLocalExperimentDTO> {
    return this.apiService.post<ProjectLocalExperimentDTO>(`${this.getBaseUrl(projectId)}/local`, experiment)
      .pipe(
        catchError((err) => {
          const errorMessage = JSON.stringify(err.error) || this.translate.instant('ERROR.FAILED_TO_CREATE', {name: this.translate.instant('GRID.PROJECT').toLowerCase()});
          this.errorSnackbarService.showSnackBar(errorMessage, this.translate.instant('BUTTON.CLOSE'));
          return throwError(() => err);
        })
      );
  }

  public createLocalTestExperiment(projectId: number): Observable<ProjectLocalExperimentDTO> {
    return this.apiService.postEmpty<ProjectLocalExperimentDTO>(`${this.getBaseUrl(projectId)}/local/test`)
      .pipe(
        catchError((err) => {
          const errorMessage = JSON.stringify(err.error) || this.translate.instant('ERROR.FAILED_TO_CREATE', {name: this.translate.instant('GRID.PROJECT').toLowerCase()});
          this.errorSnackbarService.showSnackBar(errorMessage, this.translate.instant('BUTTON.CLOSE'));
          return throwError(() => err);
        })
      );
  }

  public startLocalExperiment(projectId: number, experimentId: number): Observable<ProjectLocalExperimentDTO> {
    return this.apiService.putEmpty<ProjectLocalExperimentDTO>(`${this.getBaseUrl(projectId)}/local/${experimentId}/start`)
      .pipe(
        catchError((err) => {
          const errorMessage = JSON.stringify(err.error) || this.translate.instant('ERROR.FAILED_TO_RUN', {name: this.translate.instant('GRID.PROJECT').toLowerCase()});
          this.errorSnackbarService.showSnackBar(errorMessage, this.translate.instant('BUTTON.CLOSE'));
          return throwError(() => err);
        })
      );
  }

  public stopLocalExperiment(projectId: number, experimentId: number): Observable<ProjectLocalExperimentDTO> {
    return this.apiService.putEmpty<ProjectLocalExperimentDTO>(`${this.getBaseUrl(projectId)}/local/${experimentId}/stop`)
      .pipe(
        catchError((err) => {
          const errorMessage = JSON.stringify(err.error) || this.translate.instant('ERROR.FAILED_TO_STOP', {name: this.translate.instant('GRID.PROJECT').toLowerCase()});
          this.errorSnackbarService.showSnackBar(errorMessage, this.translate.instant('BUTTON.CLOSE'));
          return throwError(() => err);
        })
      );
  }

  streamExperimentFederated(projectId: number, experimentId: number): Observable<ProjectFederatedExperimentDetailDTO> {
    const url = `${this.getBaseUrl(projectId)}/federated/${experimentId}`;
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
        return JSON.parse(messageEvent.data) as ProjectFederatedExperimentDetailDTO;
      }),
     // takeWhile(experiment => experiment.experimentStatus !== ProjectStatus.FINISHED)
    );
  }

  streamExperiment(projectId: number, experimentId: number): Observable<ProjectLocalExperimentDTO> {
    const url = `${this.getBaseUrl(projectId)}/local/${experimentId}`;
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
        return JSON.parse(messageEvent.data) as ProjectLocalExperimentDTO;
      }),
      takeWhile(experiment => experiment.experimentStatus !== ProjectStatus.FINISHED)
    );
  }

  streamExperimentTest(projectId: number): Observable<ProjectLocalExperimentDTO> {
    const url = `${this.getBaseUrl(projectId)}/local/test`;
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
        return JSON.parse(messageEvent.data) as ProjectLocalExperimentDTO;
      }),
      takeWhile(experiment => experiment.experimentStatus !== ProjectStatus.FINISHED)
    );
  }

  public getFederatedStepDetailUpdates(id: number, experimentId: number, stepId: number): Observable<ProjectFederatedExperimentStepDetailDTO> {
    return this.apiService.get<ProjectFederatedExperimentStepDetailDTO>(`${this.getBaseUrl(id)}/federated/${experimentId}/step/${stepId}`)
      .pipe(
        catchError((err) => this.errorSnackbarService.showSnackBar(err,
          this.translate.instant('ERROR.FAILED_TO_FETCH', {name: this.translate.instant('GRID.FEDERATED_STEP_DETAIL_UPDATES').toLowerCase()}))),
      );
  }

  public streamLocalLogMessages(projectId: number, experimentId: number, stepId: number): Observable<RunMessageLogDTO> {
    const url = `${this.getBaseUrl(projectId)}/local/${experimentId}/step/${stepId}/messages`;
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

  public getLocalStepDetailUpdates(id: number, experimentId: number, stepId: number): Observable<ProjectLocalExperimentStepDetailDTO> {
    return this.apiService.get<ProjectLocalExperimentStepDetailDTO>(`${this.getBaseUrl(id)}/local/${experimentId}/step/${stepId}`)
      .pipe(
        catchError((err) => this.errorSnackbarService.showSnackBar(err,
          this.translate.instant('ERROR.FAILED_TO_FETCH', {name: this.translate.instant('GRID.LOCAL_STEP_DETAIL_UPDATES').toLowerCase()}))),
      );
  }


  private getBaseUrl(projectId: number): string {
    return `${this.apiUrl}/${this.path}/${projectId}/experiment`;
  }

}
