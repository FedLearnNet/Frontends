import {inject, Injectable} from '@angular/core';
import {ApiService} from '@shared-lib/services/api.service';
import {environment} from '@local-app/env/environment';
import {map, Observable, takeWhile} from 'rxjs';
import {HttpHeaders, HttpParams} from "@angular/common/http";
import {SseClient} from 'ngx-sse-client';
import {SKIP_LOADING} from "@shared-lib/interceptors/loading.interceptor";
import {PatientDataExportConfigDTO} from "@shared-lib/modules/data-modeler/dto/data-export.dto";
import {PatientReferenceDto} from "../dto/patient";
import {isTerminalRunStatus, PatientToolRunProgressDTO, PatientToolRunSummaryDTO} from "../dto/patient-tool-run";


@Injectable({
  providedIn: 'root'
})
export class PatientDataExportService {
  private readonly apiService: ApiService = inject(ApiService);
  private readonly sseClient: SseClient = inject(SseClient);
  private readonly apiUrl = environment.localLearningAPIURL;


  exportCohortPatientData(
    cohortId: number,
    config: PatientDataExportConfigDTO,
  ): Observable<HTMLAnchorElement> {
    const url = this.getBaseUrl(cohortId);
    const params: HttpParams = new HttpParams().set('downloadFiles', true);
    return this.apiService.downloadPost(url, params, undefined, config);
  }

  exportSinglePatientData(
    cohortId: number,
    patientId: number,
    config: PatientDataExportConfigDTO,
  ): Observable<HTMLAnchorElement> {
    const url = `${this.getBaseUrl(cohortId)}/${patientId}`;
    const params: HttpParams = new HttpParams().set('downloadFiles', true);
    return this.apiService.downloadPost(url, params, undefined, config);
  }


  /**
   * Runs the export app of an app-based export and streams its progress. Completes after the
   * terminal event; once that reports the run as finished its outputs can be downloaded.
   */
  streamAppExport(cohortId: number, config: PatientDataExportConfigDTO): Observable<PatientToolRunProgressDTO> {
    const url = `${this.getBaseUrl(cohortId)}/app/stream`;
    const headers = new HttpHeaders().set(SKIP_LOADING, 'true');
    return this.sseClient
      .stream(url, {keepAlive: false, responseType: 'event'}, {body: config, headers}, 'POST')
      .pipe(
        map(evt => {
          if (evt.type === 'error') {
            const message = (evt as ErrorEvent)?.message || 'The export stream was interrupted';
            throw new Error(message);
          }
          const data = (evt as MessageEvent).data;
          return (typeof data === 'string' ? JSON.parse(data) : data) as PatientToolRunProgressDTO;
        }),
        takeWhile(msg => !isTerminalRunStatus(msg.status?.runStatus), true),
      );
  }

  /** The latest app-based exports of a cohort, newest first. */
  listAppExports(cohortId: number): Observable<PatientToolRunSummaryDTO[]> {
    return this.apiService.get<PatientToolRunSummaryDTO[]>(`${this.getBaseUrl(cohortId)}/app`);
  }

  /** The outputs of a finished app-based export as zip. */
  downloadAppExport(cohortId: number, runId: number): Observable<HTMLAnchorElement> {
    return this.apiService.download(`${this.getBaseUrl(cohortId)}/app/${runId}/download`);
  }

  /** Identifiers of the cohort's patients, for the export patient filter. */
  listPatientReferences(cohortId: number, limit = 1000): Observable<PatientReferenceDto[]> {
    const url = `${this.apiUrl}/cohort/${cohortId}/data/patient/references`;
    return this.apiService.get<PatientReferenceDto[]>(`${url}?limit=${limit}`);
  }

  private getBaseUrl(cohortId: number): string {
    return `${this.apiUrl}/cohort/${cohortId}/data/patient/export`;
  }
}
