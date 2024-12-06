import {inject, Injectable} from '@angular/core';
import {ApiService} from '@shared-lib/services/api.service';
import {catchError, Observable, of, throwError} from 'rxjs';
import {environment} from '@local-app/env/environment';
import {HttpClient, HttpParams} from "@angular/common/http";
import {RunDTO} from "../dto/run";
import {RunChangesOverviewLogDTO, RunErrorLogDTO, RunLogDTO} from "../dto/log";
import {RunLogsType} from "../enum/run-logs";
import {ApiErrorSnackbarService} from "@shared-lib/services/api-error-snackbar.service";

@Injectable({
  providedIn: 'root'
})
export class ConnectorRunService {
  private readonly errorSnackbarService: ApiErrorSnackbarService = inject(ApiErrorSnackbarService);
  private readonly apiService: ApiService = inject(ApiService);
  private readonly http: HttpClient = inject(HttpClient);

  private readonly apiUrl = environment.importerApiUrl;
  private readonly harmonizedApiUrl= environment.harmonizedApiUrl;
  private readonly path = 'run'

  public get(runId: number | string | null): Observable<RunDTO | null> {
    if (!runId) {
      return of(null);
    }
    if (typeof runId === 'string') {
      runId = parseInt(runId);
    }
    return this.apiService.get<RunDTO>(`${this.getBaseUrl()}/${runId}/`).pipe(
      catchError((err) => this.errorSnackbarService.showSnackBar(err,
        'Failed to get run')),
    );
  }

  public runConnector(connectorId: number, runMode: string, dryRun: boolean): Observable<RunDTO> {

    return this.http.post<RunDTO>(`${this.apiUrl}/connector/${connectorId}/run/`, {}, {
      params: {
        run_mode: runMode,
        dry: dryRun
      }
    }).pipe(
      catchError((err) => this.errorSnackbarService.showSnackBar(err,
        'Failed to run  connector')),
    );
  }

  public getAllForConnector(connectorId: number): Observable<RunDTO[]> {
    return this.apiService.get<RunDTO[]>(`${this.getBaseUrl()}/${connectorId}/all_for_connector/`)
      .pipe(
        catchError((err) => this.errorSnackbarService.showSnackBar(err,
          'Failed to fetch runs')),
      );
  }


  getRunErrorLogs(runId: number, logsType: RunLogsType = RunLogsType.RUN_ERROR): Observable<RunErrorLogDTO[]> {
    let params = new HttpParams()

    if (logsType == RunLogsType.HARMONIZER) {
      params = params.set('type', 'Persistent');
    }

    return this.http.get<RunErrorLogDTO[]>(`${this.getBaseUrl()}/${runId}/get_run_logs/`, {
      params: params,
    })
      .pipe(
        catchError((err) => this.errorSnackbarService.showSnackBar(err,
          'Failed to fetch error logs')),
      );
  }

  getErrorLogs(runId: number): Observable<RunLogDTO[]> {
    return this.apiService.get<RunLogDTO[]>(`${this.getBaseUrl()}/${runId}/get_logs/`)
      .pipe(
        catchError((err) => this.errorSnackbarService.showSnackBar(err,
          'Failed to fetch error logs')),
      );
  }

  getRunChangesLogs(schemaId: string, runId: number, page: number, page_size: number, search?: string): Observable<RunChangesOverviewLogDTO> {
    let params = new HttpParams()
    if (search) {
      params = params.set('search', search);
    }
    params = params.set('page', page);
    params = params.set('page_size', page_size);


    return this.http.get<RunChangesOverviewLogDTO>(`${this.harmonizedApiUrl}/${schemaId}/data/${runId}/get_for_run/`, {
      params: params,
    })
      .pipe(
        catchError((err) => this.errorSnackbarService.showSnackBar(err,
          'Failed to fetch change logs')),
      );
  }

  private getBaseUrl(): string {
    return `${this.apiUrl}/${this.path}`;
  }
}
