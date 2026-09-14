import {inject, Injectable} from "@angular/core";
import {ApiService} from "@shared-lib/services/api.service";
import {catchError, Observable, of} from "rxjs";
import {environment} from "@global-app/env/environment";
import {RunMessageLogDTO, RunMessageMetricDTO} from "@shared-lib/modules/experiments/dto/log";
import {TranslateService} from '@ngx-translate/core';
import {
  CreateExperimentDetailDTO,
  ExperimentDetailDTO,
  ExperimentDTO,
  ExperimentRunDTO
} from "@shared-lib/modules/app-execution/dto/experiment";
import {ApiErrorSnackbarService} from "@shared-lib/services/api-error-snackbar.service";

@Injectable({
  providedIn: 'root'
})
export class ExperimentService {
  private readonly apiService: ApiService = inject(ApiService);
  private readonly translate: TranslateService = inject(TranslateService);
  private readonly errorSnackbarService: ApiErrorSnackbarService = inject(ApiErrorSnackbarService);

  private readonly apiUrl = environment.globalLearningApiUrl;
  private readonly path = 'runs/experiment/'


  public getExperiments(appId: number): Observable<ExperimentDTO[]> {
    return this.apiService.get<ExperimentDTO[]>(`${this.getBaseUrl()}${appId}`)
      .pipe(
        catchError((err) => this.errorSnackbarService.showSnackBar(
          err,
          this.translate.instant('ERROR.FAILED_TO_FETCH', {name: this.translate.instant('GRID.RUNS').toLowerCase()})
        ))
      );
  }

  public updateExperiment(appId: number, experiment: ExperimentDTO): Observable<ExperimentDTO> {
    return this.apiService.put<ExperimentDTO>(`${this.getBaseUrl()}${appId}/experiment/${experiment.id}`, experiment)
      .pipe(
        catchError((err) => this.errorSnackbarService.showSnackBar(
          err,
          this.translate.instant('ERROR.FAILED_TO_UPDATE', {name: this.translate.instant('GRID.EXPERIMENT').toLowerCase()})
        ))
      );
  }

  public createExperiment(appId: number, experiment: CreateExperimentDetailDTO): Observable<ExperimentDTO> {
    return this.apiService.post<ExperimentDTO>(`${this.getBaseUrl()}${appId}/experiment`, experiment)
      .pipe(
        catchError((err) => this.errorSnackbarService.showSnackBar(
          err,
          this.translate.instant('ERROR.FAILED_TO_CREATE', {name: this.translate.instant('GRID.EXPERIMENT').toLowerCase()})
        ))
      );
  }

  public getExperiment(appId: number | string | null, experimentId: number | string | null): Observable<ExperimentDetailDTO> {

    if (!appId || !experimentId) {
      return of({} as ExperimentDetailDTO);
    }
    return this.apiService.get<ExperimentDetailDTO>(`${this.getBaseUrl()}${appId}/experiment/${experimentId}`)
      .pipe(
        catchError((err) => this.errorSnackbarService.showSnackBar(
          err,
          this.translate.instant('ERROR.FAILED_TO_FETCH', {name: this.translate.instant('GRID.EXPERIMENT_DETAIL_DTO').toLowerCase()})
        ))
      );
  }

  public getRuns(appId: number, experimentId: number): Observable<ExperimentRunDTO[]> {
    return this.apiService.get<ExperimentRunDTO[]>(`${this.getBaseUrl()}${appId}/experiment/${experimentId}/runs`)
      .pipe(
        catchError((err) => this.errorSnackbarService.showSnackBar(
          err,
          this.translate.instant('ERROR.FAILED_TO_FETCH', {name: this.translate.instant('GRID.RUNS').toLowerCase()})
        ))
      );
  }


  public getLogs(appId: number, experimentId: number, runId: number): Observable<RunMessageLogDTO[]> {
    return this.apiService.get<RunMessageLogDTO[]>(`${this.getBaseUrl()}${appId}/experiment/${experimentId}/run/${runId}/log`)
      .pipe(
        catchError((err) => this.errorSnackbarService.showSnackBar(
          err,
          this.translate.instant('ERROR.FAILED_TO_FETCH', {name: this.translate.instant('GRID.LOGS').toLowerCase()})
        ))
      );
  }

  public getMetricsByRun(appId: number, experimentId: number, runId: number): Observable<RunMessageMetricDTO[]> {
    return this.apiService.get<RunMessageMetricDTO[]>(`${this.getBaseUrl()}${appId}/experiment/${experimentId}/run/${runId}/metric`)
      .pipe(
        catchError((err) => this.errorSnackbarService.showSnackBar(
          err,
          this.translate.instant('ERROR.FAILED_TO_FETCH', {name: this.translate.instant('GRID.METRICS').toLowerCase()})
        ))
      );
  }

  public getMetrics(appId: number, experimentId: number): Observable<RunMessageMetricDTO[]> {
    return this.apiService.get<RunMessageMetricDTO[]>(`${this.getBaseUrl()}${appId}/experiment/${experimentId}/metric`)
      .pipe(
        catchError((err) => this.errorSnackbarService.showSnackBar(
          err,
          this.translate.instant('ERROR.FAILED_TO_FETCH', {name: this.translate.instant('GRID.METRICS').toLowerCase()})
        ))
      );
  }


  private getBaseUrl(): string {
    return `${this.apiUrl}/${this.path}`;
  }
}
