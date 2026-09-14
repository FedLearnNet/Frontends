import {inject, Injectable} from '@angular/core';
import {catchError, Observable} from 'rxjs';
import {TranslateService} from '@ngx-translate/core';
import {ApiService} from '@shared-lib/services/api.service';
import {ApiErrorSnackbarService} from '@shared-lib/services/api-error-snackbar.service';
import {environment} from '@global-app/env/environment';
import {EvaluationSummaryDto, RunMetricsRequestDto} from '@global-app/project/dto/run-metrics-request';

@Injectable({
  providedIn: 'root'
})
export class RunMetricsRequestService {
  private readonly apiService = inject(ApiService);
  private readonly errorSnackbarService = inject(ApiErrorSnackbarService);
  private readonly translate = inject(TranslateService);
  private readonly apiUrl = environment.globalLearningApiUrl;

  getRequest(projectId: number, experimentId: number): Observable<RunMetricsRequestDto | null> {
    return this.apiService.get<RunMetricsRequestDto | null>(this.baseUrl(projectId, experimentId));
  }

  createRequest(projectId: number, experimentId: number): Observable<RunMetricsRequestDto> {
    return this.apiService.postEmpty<RunMetricsRequestDto>(this.baseUrl(projectId, experimentId)).pipe(
      catchError((err) => this.errorSnackbarService.showSnackBar(
        err,
        this.translate.instant('ERROR.FAILED_TO_CREATE', {name: 'metrics request'})
      ))
    );
  }

  getEvaluationSummary(projectId: number, experimentId: number): Observable<EvaluationSummaryDto> {
    return this.apiService.get<EvaluationSummaryDto>(`${this.baseUrl(projectId, experimentId)}/evaluation`);
  }

  exportEvaluationCsv(projectId: number, experimentId: number): Observable<HTMLAnchorElement> {
    return this.apiService.download(`${this.baseUrl(projectId, experimentId)}/evaluation/export.csv`).pipe(
      catchError((err) => this.errorSnackbarService.showSnackBar(
        err,
        this.translate.instant('ERROR.FAILED_TO_DOWNLOAD', {name: 'evaluation CSV'})
      ))
    );
  }

  private baseUrl(projectId: number, experimentId: number): string {
    return `${this.apiUrl}/project/${projectId}/experiment/federated/${experimentId}/metrics-request`;
  }
}
