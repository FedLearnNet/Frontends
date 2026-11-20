import {inject, Injectable} from "@angular/core";
import {environment} from "@global-app/env/environment";
import {SseClient} from "ngx-sse-client";
import {catchError, map, Observable, takeWhile} from "rxjs";
import {
  DataAnalysisCreatePredictionDTO,
  DataAnalysisRunModesEnum
} from "@shared-lib/modules/app-execution/dto/prediction";
import {DataAnalysisRunDTO, isFinalStatus} from "@shared-lib/modules/app-execution/dto/execution-run";
import {HttpHeaders, HttpParams} from '@angular/common/http';
import {SKIP_LOADING} from "@shared-lib/interceptors/loading.interceptor";
import {ApiService} from "@shared-lib/services/api.service";
import {ApiErrorSnackbarService} from "@shared-lib/services/api-error-snackbar.service";
import {TranslateService} from "@ngx-translate/core";

@Injectable({
  providedIn: 'root'
})
export class ModelExecutionService {
  private readonly sseClient: SseClient = inject(SseClient);
  private readonly apiUrl = environment.globalLearningApiUrl + '/model/run';
  private readonly apiService: ApiService = inject(ApiService);
  private readonly errorSnackbarService: ApiErrorSnackbarService = inject(ApiErrorSnackbarService);
  private readonly translate: TranslateService = inject(TranslateService);

  /** Starts a run outside a data analysis and follows it until it is done. */
  startRun(toCreate: DataAnalysisCreatePredictionDTO): Observable<DataAnalysisRunDTO> {
    return this.streamRun(this.apiUrl, 'POST', toCreate);
  }

  /** Starts a run of the data analysis and follows it until it is done. */
  startAnalysisRun(dataAnalysisId: number, toCreate: DataAnalysisCreatePredictionDTO): Observable<DataAnalysisRunDTO> {
    return this.streamRun(`${this.apiUrl}/workflow/${dataAnalysisId}`, 'POST', toCreate);
  }

  /** Follows a run until it is done, starting with its current state. */
  followRun(runId: number): Observable<DataAnalysisRunDTO> {
    return this.streamRun(`${this.apiUrl}/${runId}`, 'GET');
  }

  public stopRun(dataAnalysisId: number, runId: number): Observable<DataAnalysisRunDTO> {
    const headers = new HttpHeaders().set(SKIP_LOADING, "true");

    return this.apiService.put<DataAnalysisRunDTO>(`${this.apiUrl}/workflow/${dataAnalysisId}/${runId}`, undefined, headers);
  }

  public deleteRun(
    dataAnalysisId: number,
    id: number,
    workflowId?: number
  ): Observable<void> {
    const headers = new HttpHeaders().set(SKIP_LOADING, "true");
    let params = new HttpParams();
    if (workflowId) {
      params = params.set("workflowId", workflowId);
    }
    return this.apiService.delete<void>(
      `${this.apiUrl}/workflow/${dataAnalysisId}/${id}`,
      headers,
      params,
    );
  }

  public downloadOutput(
    containerId: string,
    mode: DataAnalysisRunModesEnum,
  ): Observable<HTMLAnchorElement> {
    const headers = new HttpHeaders().set(SKIP_LOADING, "true");

    return this.apiService.download(`${this.apiUrl}/${mode}/${containerId}/download`, undefined, headers).pipe(
      catchError((err) => this.errorSnackbarService.showSnackBar(
          err,
          this.translate.instant('ERROR.FAILED_TO_FETCH', {
            name: this.translate.instant('GRID.ZIP').toLowerCase()
          })
        )
      )
    );
  }

  public downloadWholeOutput(
    experimentId: number,
  ): Observable<HTMLAnchorElement> {
    const headers = new HttpHeaders().set(SKIP_LOADING, "true");

    return this.apiService.download(`${this.apiUrl}/workflow/all/${experimentId}/download`, undefined, headers).pipe(
      catchError((err) => this.errorSnackbarService.showSnackBar(
          err,
          this.translate.instant('ERROR.FAILED_TO_FETCH', {
            name: this.translate.instant('GRID.ZIP').toLowerCase()
          })
        )
      )
    );
  }

  // Each event is the whole run; the stream closes after the event that finishes it.
  private streamRun(url: string, method: 'GET' | 'POST', body?: DataAnalysisCreatePredictionDTO): Observable<DataAnalysisRunDTO> {
    const headers = new HttpHeaders().set(SKIP_LOADING, 'true');
    return this.sseClient.stream(
      url,
      {keepAlive: false, responseType: 'event'},
      {body, headers},
      method
    ).pipe(
      map(event => {
        if (event.type === 'error') {
          const errorEvent = event as ErrorEvent;
          console.error(errorEvent.error, errorEvent.message);
          throw new Error('SSE connection error');
        }
        return JSON.parse((event as MessageEvent).data) as DataAnalysisRunDTO;
      }),
      takeWhile(run => !isFinalStatus(run.status), true)
    );
  }
}
