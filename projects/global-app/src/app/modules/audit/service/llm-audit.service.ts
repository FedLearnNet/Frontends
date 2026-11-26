import {inject, Injectable} from "@angular/core";
import {HttpHeaders, HttpParams} from "@angular/common/http";
import {Observable} from "rxjs";
import {catchError} from "rxjs/operators";
import {ApiService} from "@shared-lib/services/api.service";
import {ApiErrorSnackbarService} from "@shared-lib/services/api-error-snackbar.service";
import {SKIP_LOADING} from "@shared-lib/interceptors/loading.interceptor";
import {environment} from "@global-app/env/environment";
import {LlmAuditDTO, LlmAuditQuotaDTO} from "../dto/llm-audit";

@Injectable({providedIn: 'root'})
export class LlmAuditService {
  private readonly api = inject(ApiService);
  private readonly errorSnackbarService = inject(ApiErrorSnackbarService);

  private readonly baseUrl = `${environment.globalLearningApiUrl}/apps/llm-audit`;
  private readonly headers = new HttpHeaders().set(SKIP_LOADING, 'true');

  // null without any audit (204)
  latest(versionId: number): Observable<LlmAuditDTO | null> {
    return this.api.get<LlmAuditDTO | null>(`${this.baseUrl}/tool-version/${versionId}/latest`, undefined, this.headers)
      .pipe(catchError(err => this.errorSnackbarService.showSnackBar(err, 'Failed to load the AI audit')));
  }

  list(versionId: number): Observable<LlmAuditDTO[]> {
    return this.api.get<LlmAuditDTO[]>(`${this.baseUrl}/tool-version/${versionId}`, undefined, this.headers)
      .pipe(catchError(err => this.errorSnackbarService.showSnackBar(err, 'Failed to load the AI audits')));
  }

  request(versionId: number, force = false): Observable<LlmAuditDTO> {
    const params = force ? new HttpParams().set('force', true) : undefined;
    return this.api.post<LlmAuditDTO>(`${this.baseUrl}/tool-version/${versionId}`, null, this.headers, params)
      .pipe(catchError(err => this.errorSnackbarService.showSnackBar(err, 'Failed to request an AI audit')));
  }

  quota(): Observable<LlmAuditQuotaDTO> {
    return this.api.get<LlmAuditQuotaDTO>(`${this.baseUrl}/quota`, undefined, this.headers)
      .pipe(catchError(err => this.errorSnackbarService.showSnackBar(err, 'Failed to load the AI audit quota')));
  }
}
