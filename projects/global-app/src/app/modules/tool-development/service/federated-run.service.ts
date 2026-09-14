import {inject, Injectable} from "@angular/core";
import {ApiService} from "@shared-lib/services/api.service";
import {catchError, Observable} from "rxjs";
import {environment} from "@global-app/env/environment";
import {TranslateService} from '@ngx-translate/core';
import {ApiErrorSnackbarService} from "@shared-lib/services/api-error-snackbar.service";
import {FederatedParticipantDTO, FederatedRoundMessageDTO, FederatedTestRunDTO,} from "../dto/federated-test-run";
import {RunMessageLogDTO, RunMessageMetricDTO} from "@shared-lib/modules/experiments/dto/log";

@Injectable({
  providedIn: 'root'
})
export class FederatedRunService {
  private readonly apiService: ApiService = inject(ApiService);
  private readonly translate: TranslateService = inject(TranslateService);
  private readonly errorSnackbarService: ApiErrorSnackbarService = inject(ApiErrorSnackbarService);

  private readonly apiUrl = environment.globalLearningApiUrl;
  private readonly path = 'runs/federated/';

  public getRuns(appId: number): Observable<FederatedTestRunDTO[]> {
    return this.apiService.get<FederatedTestRunDTO[]>(`${this.getBaseUrl()}${appId}`)
      .pipe(
        catchError((err) => this.errorSnackbarService.showSnackBar(err,
          this.translate.instant('ERROR.FAILED_TO_FETCH', {name: this.translate.instant('ERROR.RUNS').toLowerCase()})))
      );
  }

  public getRun(appId: number, runId: number): Observable<FederatedTestRunDTO> {
    return this.apiService.get<FederatedTestRunDTO>(`${this.getBaseUrl()}${appId}/run/${runId}`)
      .pipe(
        catchError((err) => this.errorSnackbarService.showSnackBar(err,
          this.translate.instant('ERROR.FAILED_TO_FETCH', {name: this.translate.instant('ERROR.RUNS').toLowerCase()})))
      );
  }

  public getParticipants(appId: number, runId: number): Observable<FederatedParticipantDTO[]> {
    return this.apiService.get<FederatedParticipantDTO[]>(`${this.getBaseUrl()}${appId}/run/${runId}/participants`)
      .pipe(
        catchError((err) => this.errorSnackbarService.showSnackBar(err,
          this.translate.instant('ERROR.FAILED_TO_FETCH', {name: this.translate.instant('ERROR.RUNS').toLowerCase()})))
      );
  }

  public getRoundMessages(appId: number, runId: number): Observable<FederatedRoundMessageDTO[]> {
    return this.apiService.get<FederatedRoundMessageDTO[]>(`${this.getBaseUrl()}${appId}/run/${runId}/messages`)
      .pipe(
        catchError((err) => this.errorSnackbarService.showSnackBar(err,
          this.translate.instant('ERROR.FAILED_TO_FETCH', {name: this.translate.instant('ERROR.RUNS').toLowerCase()})))
      );
  }

  public getLogs(appId: number, runId: number, participantId: number): Observable<RunMessageLogDTO[]> {
    return this.apiService.get<RunMessageLogDTO[]>(`${this.getBaseUrl()}${appId}/run/${runId}/participant/${participantId}/log`)
      .pipe(
        catchError((err) => this.errorSnackbarService.showSnackBar(err,
          this.translate.instant('ERROR.FAILED_TO_FETCH', {name: this.translate.instant('ERROR.LOG_MESSAGES').toLowerCase()})))
      );
  }

  public getMetrics(appId: number, runId: number, participantId: number): Observable<RunMessageMetricDTO[]> {
    return this.apiService.get<RunMessageMetricDTO[]>(`${this.getBaseUrl()}${appId}/run/${runId}/participant/${participantId}/metric`)
      .pipe(
        catchError((err) => this.errorSnackbarService.showSnackBar(err,
          this.translate.instant('ERROR.FAILED_TO_FETCH', {name: this.translate.instant('ERROR.METRIC_MESSAGES').toLowerCase()})))
      );
  }

  public downloadOutput(appId: number, runId: number): Observable<HTMLAnchorElement> {
    return this.apiService.download(
      `${this.apiUrl}/testembed/${appId}/upload/output/${runId}?runType=FEDERATED_RUN`
    ).pipe(
      catchError((err) => this.errorSnackbarService.showSnackBar(err,
        this.translate.instant('ERROR.FAILED_TO_FETCH', {name: 'output'})))
    );
  }

  private getBaseUrl(): string {
    return `${this.apiUrl}/${this.path}`;
  }
}
