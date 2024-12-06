import {Injectable} from "@angular/core";
import {ApiService} from "@shared-lib/services/api.service";
import {HttpClient, HttpParams} from "@angular/common/http";
import {MatSnackBar} from "@angular/material/snack-bar";
import {catchError, EMPTY, map, Observable, of, throwError} from "rxjs";
import {environment} from "@global-app/env/environment";
import {TestRunDTO} from "../dto/test-run";
import {RunMessageDTO, RunMessageLogDTO, RunMessageMetricDTO} from "../dto/log";

@Injectable({
  providedIn: 'root'
})
export class TestRunService {
  private readonly apiUrl;
  private readonly path = 'runs/test/'

  constructor(
    private apiService: ApiService,
    private http: HttpClient,
    private snackBar: MatSnackBar
  ) {
    this.apiUrl = environment.globalDBApiUrl;
  }

  public getRuns(appId: number): Observable<TestRunDTO[]> {
    return this.apiService.get<TestRunDTO[]>(`${this.getBaseUrl()}${appId}`)
      .pipe(
        catchError((err) => {
          const errorMessage = JSON.stringify(err.error) || 'Failed to fetch runs';
          this.snackBar.open(errorMessage, 'Close', {duration: 5000});
          return throwError(() => err);
        })
      );
  }


  public getLogs(appId: number, runId: number): Observable<RunMessageLogDTO[]> {
    return this.apiService.get<RunMessageLogDTO[]>(`${this.getBaseUrl()}${appId}/run/${runId}/log`)
      .pipe(
        catchError((err) => {
          const errorMessage = JSON.stringify(err.error) || 'Failed to fetch logs';
          this.snackBar.open(errorMessage, 'Close', {duration: 5000});
          return throwError(() => err);
        })
      );
  }

  public getMetrics(appId: number, runId: number): Observable<RunMessageMetricDTO[]> {
    return this.apiService.get<RunMessageMetricDTO[]>(`${this.getBaseUrl()}${appId}/run/${runId}/metric`)
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
