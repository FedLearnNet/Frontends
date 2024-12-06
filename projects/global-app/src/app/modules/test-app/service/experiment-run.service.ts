import {Injectable} from "@angular/core";
import {ApiService} from "@shared-lib/services/api.service";
import {HttpClient, HttpParams} from "@angular/common/http";
import {MatSnackBar} from "@angular/material/snack-bar";
import {catchError, EMPTY, map, Observable, of, throwError} from "rxjs";
import {environment} from "@global-app/env/environment";
import {TestRunDTO} from "../dto/test-run";
import {RunMessageDTO, RunMessageLogDTO, RunMessageMetricDTO} from "../dto/log";
import {CreateExperimentDetailDTO, ExperimentDetailDTO, ExperimentDTO, ExperimentRunDTO} from "../dto/experiment";

@Injectable({
  providedIn: 'root'
})
export class ExperimentService {
  private readonly apiUrl;
  private readonly path = 'runs/experiment/'

  constructor(
    private apiService: ApiService,
    private http: HttpClient,
    private snackBar: MatSnackBar
  ) {
    this.apiUrl = environment.globalDBApiUrl;
  }

  public getExperiments(appId: number): Observable<ExperimentDTO[]> {
    return this.apiService.get<ExperimentDTO[]>(`${this.getBaseUrl()}${appId}`)
      .pipe(
        catchError((err) => {
          const errorMessage = JSON.stringify(err.error) || 'Failed to fetch runs';
          this.snackBar.open(errorMessage, 'Close', {duration: 5000});
          return throwError(() => err);
        })
      );
  }

  public updateExperiment(appId: number, experiment: ExperimentDTO): Observable<ExperimentDTO> {
    return this.apiService.put<ExperimentDTO>(`${this.getBaseUrl()}${appId}/experiment/${experiment.id}`, experiment)
      .pipe(
        catchError((err) => {
          const errorMessage = JSON.stringify(err.error) || 'Failed to update experiment';
          this.snackBar.open(errorMessage, 'Close', {duration: 5000});
          return throwError(() => err);
        })
      );
  }

  public createExperiment(appId: number, experiment: CreateExperimentDetailDTO): Observable<ExperimentDTO> {
    return this.apiService.post<ExperimentDTO>(`${this.getBaseUrl()}${appId}/experiment`, experiment)
      .pipe(
        catchError((err) => {
          const errorMessage = err.message || 'Failed to create experiment';
          this.snackBar.open(errorMessage, 'Close', {duration: 5000});
          return throwError(() => err);
        })
      );
  }

  public getExperiment(appId: number | string | null, experimentId: number | string  | null): Observable<ExperimentDetailDTO> {

    if (!appId || !experimentId) {
      return of({} as ExperimentDetailDTO);
    }
    return this.apiService.get<ExperimentDetailDTO>(`${this.getBaseUrl()}${appId}/experiment/${experimentId}`)
      .pipe(
        catchError((err) => {
          const errorMessage = JSON.stringify(err.error) || 'Failed to fetch ExperimentDetailDTO';
          this.snackBar.open(errorMessage, 'Close', {duration: 5000});
          return throwError(() => err);
        })
      );
  }

  public getRuns(appId: number, experimentId: number): Observable<ExperimentRunDTO[]> {
    return this.apiService.get<ExperimentRunDTO[]>(`${this.getBaseUrl()}${appId}/experiment/${experimentId}/runs`)
      .pipe(
        catchError((err) => {
          const errorMessage = JSON.stringify(err.error) || 'Failed to fetch runs';
          this.snackBar.open(errorMessage, 'Close', {duration: 5000});
          return throwError(() => err);
        })
      );
  }


  public getLogs(appId: number, experimentId: number, runId: number): Observable<RunMessageLogDTO[]> {
    return this.apiService.get<RunMessageLogDTO[]>(`${this.getBaseUrl()}${appId}/experiment/${experimentId}/run/${runId}/log`)
      .pipe(
        catchError((err) => {
          const errorMessage = JSON.stringify(err.error) || 'Failed to fetch logs';
          this.snackBar.open(errorMessage, 'Close', {duration: 5000});
          return throwError(() => err);
        })
      );
  }

  public getMetricsByRun(appId: number, experimentId: number, runId: number): Observable<RunMessageMetricDTO[]> {
    return this.apiService.get<RunMessageMetricDTO[]>(`${this.getBaseUrl()}${appId}/experiment/${experimentId}/run/${runId}/metric`)
      .pipe(
        catchError((err) => {
          const errorMessage = JSON.stringify(err.error) || 'Failed to fetch metrics';
          this.snackBar.open(errorMessage, 'Close', {duration: 5000});
          return throwError(() => err);
        })
      );
  }

  public getMetrics(appId: number, experimentId: number): Observable<RunMessageMetricDTO[]> {
    return this.apiService.get<RunMessageMetricDTO[]>(`${this.getBaseUrl()}${appId}/experiment/${experimentId}/metric`)
      .pipe(
        catchError((err) => {
          const errorMessage = JSON.stringify(err.error) || 'Failed to fetch metrics';
          this.snackBar.open(errorMessage, 'Close', {duration: 5000});
          return throwError(() => err);
        })
      );
  }



    private getBaseUrl(): string {
    return `${this.apiUrl}/${this.path}`;
  }
}
