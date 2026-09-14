import {inject, Injectable} from '@angular/core';
import {ApiService} from '@shared-lib/services/api.service';
import {catchError, map, Observable, of, throwError} from 'rxjs';
import {environment} from '@local-app/env/environment';
import {HttpHeaders, HttpParams} from "@angular/common/http";
import {SseClient} from 'ngx-sse-client';
import {ConnectorConfigDTO, PreviewResponseDTO, PreviewStageDTO} from "../dto/preview";
import {ConnectorCard} from "../models/connector-card";
import {configToConnectorConfigDTO} from "../models/connector-config";
import {FunctionsDetailDTO} from "../dto/function";
import {ApiErrorSnackbarService} from "@shared-lib/services/api-error-snackbar.service";
import {TranslateService} from '@ngx-translate/core';
import {
  ConnectorValidationBulkRequestDTO,
  ConnectorValidationResultDTO,
  PreviewValidationRequestDTO,
  PreviewValidationResponseDTO
} from '../dto/connector-validation';
import {SKIP_LOADING} from "@shared-lib/interceptors/loading.interceptor";
import {ConnectorDTO} from "../dto/connector";

export interface PreviewResult {
  rows: Map<string, any[]>;
  stages: Map<string, PreviewStageDTO>;
}

@Injectable({
  providedIn: 'root'
})
export class ConnectorPreviewService {
  private translate = inject(TranslateService);

  private readonly errorSnackbarService: ApiErrorSnackbarService = inject(ApiErrorSnackbarService);
  private readonly apiService: ApiService = inject(ApiService);
  private readonly sseClient: SseClient = inject(SseClient);

  private readonly apiUrl = environment.localLearningAPIURL;

  private readonly path = 'connectors'


  buildConfigDTO(config: ConnectorDTO, transformers: Map<string, FunctionsDetailDTO>, cohortId: number): ConnectorConfigDTO {
    config.transformer = Array.from(transformers.values());

    return configToConnectorConfigDTO({
      ...config,
      cohortId,
    });
  }

  preview(transFormerCards: ConnectorCard[], config: ConnectorDTO, transformers: Map<string, FunctionsDetailDTO>, cohortId: number): Observable<PreviewResult> {
    const dto = this.buildConfigDTO(config, transformers, cohortId);
    const headers = new HttpHeaders().set(SKIP_LOADING, 'true');

    return this.apiService.post<PreviewResponseDTO>(`${this.getBaseUrl()}/preview`, dto, headers).pipe(
      catchError((err) => {
        if (err.status === 406) {
          this.errorSnackbarService.showSnackBarOnlyText(err, err.error.detail, true);

          return throwError(() => err);
        }
        return this.errorSnackbarService.showSnackBar(err,
          this.translate.instant('ERROR.FAILED_TO_CALCULATE_PREVIEW'));
      }),
      map(response => {
        const transformedData = new Map<string, any[]>();
        const stages = new Map<string, PreviewStageDTO>();
        this.parsePreviewRows(response).forEach((json, i) => {
          const index = transFormerCards[i].id!;
          transformedData.set(index, json);
          const stage = response.stages?.[i];
          if (stage) {
            stages.set(index, stage);
          }
        });
        return {rows: transformedData, stages} as PreviewResult;
      }),
    );
  }


  previewPivot(config: ConnectorConfigDTO): Observable<any[][]> {
    const headers = new HttpHeaders().set(SKIP_LOADING, 'true');

    return this.apiService.post<PreviewResponseDTO>(`${this.getBaseUrl()}/preview/pivot`, config, headers).pipe(
      catchError((err) => {
        if (err.status === 406) {
          this.errorSnackbarService.showSnackBarOnlyText(err, err.error.detail, true);

          return throwError(() => err);
        }
        return this.errorSnackbarService.showSnackBar(err,
          this.translate.instant('ERROR.FAILED_TO_CALCULATE_PREVIEW'));
      }),
      map(response => this.parsePreviewRows(response)),
    );
  }

  bulkTestValue(cohortId: number, values: ConnectorValidationBulkRequestDTO[]): Observable<ConnectorValidationResultDTO[]> {
    const params = new HttpParams()
      .set('cohort_id', cohortId);

    return this.apiService
      .post<ConnectorValidationResultDTO[]>(
        `${this.getBaseUrl()}/check-validations-bulk`,
        values,
        undefined,
        params
      ).pipe(
        catchError((err) => of(err.error ?? [])),
      );
  }

  validatePreview(request: PreviewValidationRequestDTO): Observable<PreviewValidationResponseDTO> {
    const headers = new HttpHeaders()
      .set(SKIP_LOADING, 'true')
      .set('Content-Type', 'application/json')
      .set('Accept', 'text/event-stream');

    return this.sseClient
      .stream(
        `${this.getBaseUrl()}/preview/validations`,
        {keepAlive: false, responseType: 'event'},
        {body: request, headers},
        'POST',
      )
      .pipe(map((event: Event) => {
        if (event.type === 'error') {
          const errorEvent = event as ErrorEvent;
          throw errorEvent.error
            ?? new Error(errorEvent.message || 'Preview validation SSE connection error');
        }
        const data = (event as MessageEvent).data;
        return this.parsePreviewValidationResponse(
          typeof data === 'string' ? data : JSON.stringify(data)
        );
      }));
  }

  private parsePreviewValidationResponse(data: string): PreviewValidationResponseDTO {
    let parsed: unknown;
    try {
      parsed = JSON.parse(data);
    } catch (error) {
      throw new Error('Preview validation stream contained malformed JSON', {cause: error});
    }

    if (!parsed || typeof parsed !== 'object') {
      throw new Error('Preview validation stream contained an invalid response');
    }
    const response = parsed as Record<string, unknown>;
    if (
      typeof response['column'] !== 'string'
      || !Array.isArray(response['checks'])
      || (response['warnings'] !== null && !Array.isArray(response['warnings']))
    ) {
      throw new Error('Preview validation stream contained an invalid response');
    }

    return parsed as PreviewValidationResponseDTO;
  }

  invalidateCache(connectorId: number, fromStep?: number): Observable<void> {
    let params = new HttpParams();
    if (fromStep !== undefined && fromStep !== null) {
      params = params.set('fromStep', fromStep);
    }
    return this.apiService.delete<void>(
      `${this.getBaseUrl()}/${connectorId}/preview/cache`, undefined, params
    ).pipe(
      catchError(() => of(void 0))
    );
  }

  private getBaseUrl(): string {
    return `${this.apiUrl}/${this.path}`;
  }

  private parsePreviewRows(response: PreviewResponseDTO): any[][] {
    return response.jsons.map(jsonString => {
      const parsed = JSON.parse(jsonString);
      return Array.isArray(parsed) ? parsed : [];
    });
  }
}
