import {inject, Injectable} from "@angular/core";
import {environment} from "@global-app/env/environment";
import {SseClient} from "ngx-sse-client";
import {catchError, map, Observable, takeWhile} from "rxjs";
import {
  DataAnalysisCreatePredictionDTO,
  DataAnalysisPredictionDTO,
  DataAnalysisRunModesEnum,
  DataAnalysisStopPredictionDTO
} from "@shared-lib/modules/app-execution/dto/prediction";
import {RunStatusTypes} from "../../../../../../global-app/src/app/modules/tool-development/dto/test-run";
import {HttpHeaders, HttpParams} from '@angular/common/http';
import {SKIP_LOADING} from "@shared-lib/interceptors/loading.interceptor";
import {ApiService} from "@shared-lib/services/api.service";
import {ApiErrorSnackbarService} from "@shared-lib/services/api-error-snackbar.service";
import {TranslateService} from "@ngx-translate/core";
import {
  hasMoreSteps,
  isNotFinished
} from "../../../../../../global-app/src/app/modules/tool-development/helper/run-helper";

@Injectable({
  providedIn: 'root'
})
export class ModelExecutionService {
  private readonly sseClient: SseClient = inject(SseClient);
  private readonly apiUrl = environment.globalLearningApiUrl + '/model/run';
  private readonly apiService: ApiService = inject(ApiService);
  private readonly errorSnackbarService: ApiErrorSnackbarService = inject(ApiErrorSnackbarService);
  private readonly translate: TranslateService = inject(TranslateService);


  runModel(toCreate: DataAnalysisCreatePredictionDTO): Observable<DataAnalysisPredictionDTO> {
    const url = this.apiUrl;
    const headers = new HttpHeaders().set(SKIP_LOADING, 'true');
    return this.sseClient.stream(
      url,
      {keepAlive: false, responseType: 'event'},
      {body: toCreate, headers},
      'POST'
    ).pipe(
      map(event => {
        if (event.type === 'error') {
          const errorEvent = event as ErrorEvent;
          console.error(errorEvent.error, errorEvent.message);
          throw new Error('SSE connection error');
        }
        const messageEvent = event as MessageEvent;
        return JSON.parse(messageEvent.data) as DataAnalysisPredictionDTO;
      }),
      takeWhile(prediction => isNotFinished(prediction.status), true)
    );
  }


  runWorkflowModel(modelWorkflowId: number, toCreate: DataAnalysisCreatePredictionDTO): Observable<DataAnalysisPredictionDTO> {
    const url = `${this.apiUrl}/workflow/${modelWorkflowId}`;
    const headers = new HttpHeaders().set(SKIP_LOADING, 'true');
    return this.sseClient.stream(
      url,
      {keepAlive: false, responseType: 'event'},
      {body: toCreate, headers},
      'POST'
    ).pipe(
      map(event => {
        if (event.type === 'error') {
          const errorEvent = event as ErrorEvent;
          console.error(errorEvent.error, errorEvent.message);
          throw new Error('SSE connection error');
        }
        const messageEvent = event as MessageEvent;
        return JSON.parse(messageEvent.data) as DataAnalysisPredictionDTO;
      }),
      takeWhile(prediction => {
        const isWorkflow = prediction.workflowId !== null;
        if (isWorkflow && hasMoreSteps(prediction)) {
          return true;
        }
        return isNotFinished(prediction.status);
      }, true)
    );
  }


  public stopRun(
    dataAnalysisId: number,
    id: number,
    dto?: DataAnalysisStopPredictionDTO
  ): Observable<DataAnalysisPredictionDTO> {
    const headers = new HttpHeaders().set(SKIP_LOADING, "true");

    return this.apiService.put<DataAnalysisPredictionDTO>(
      `${this.apiUrl}/workflow/${dataAnalysisId}/${id}`,
      dto,
      headers
    );
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

  getRunningUpdates(id: number): Observable<DataAnalysisPredictionDTO> {
    const url = `${this.apiUrl}/${id}`;
    const headers = new HttpHeaders().set(SKIP_LOADING, 'true');
    return this.sseClient.stream(
      url,
      {keepAlive: false, responseType: 'event'},
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
        return JSON.parse(messageEvent.data) as DataAnalysisPredictionDTO;
      }),
      takeWhile(prediction => prediction.status !== RunStatusTypes.FINISHED &&
        prediction.status !== RunStatusTypes.STOPPED && prediction.status !== RunStatusTypes.ERROR, true)
    );
  }


  getWorkflowRunning(dataAnalysisId: number, workflowId: number): Observable<DataAnalysisPredictionDTO> {
    const url = `${this.apiUrl}/workflow/${dataAnalysisId}/${workflowId}`;
    const headers = new HttpHeaders().set(SKIP_LOADING, 'true');
    return this.sseClient.stream(
      url,
      {keepAlive: false, responseType: 'event'},
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
        return JSON.parse(messageEvent.data) as DataAnalysisPredictionDTO;
      }),
      takeWhile(prediction => prediction.status !== RunStatusTypes.FINISHED &&
        prediction.status !== RunStatusTypes.STOPPED && prediction.status !== RunStatusTypes.ERROR, true)
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
}
