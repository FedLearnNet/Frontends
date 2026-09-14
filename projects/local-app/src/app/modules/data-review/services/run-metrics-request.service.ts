import {inject, Injectable} from '@angular/core';
import {HttpParams} from '@angular/common/http';
import {catchError, Observable} from 'rxjs';
import {TranslateService} from '@ngx-translate/core';
import {PaginatedResponse} from '@shared-lib/models';
import {ApiService} from '@shared-lib/services/api.service';
import {ApiErrorSnackbarService} from '@shared-lib/services/api-error-snackbar.service';
import {environment} from '@local-app/env/environment';
import {FederatedLearningRequestStatus} from '@local-app/data-review/dto/federated-learning-request';
import {RequestRunMetricsDto} from '@local-app/data-review/dto/request-run-metrics';

@Injectable({
  providedIn: 'root'
})
export class RunMetricsRequestService {
  private readonly errorSnackbarService = inject(ApiErrorSnackbarService);
  private readonly apiService = inject(ApiService);
  private readonly translate = inject(TranslateService);
  private readonly apiUrl = environment.localLearningAPIURL;
  private readonly path = 'metrics/requests';

  getAllRequests(
    page?: number,
    pageSize?: number,
    status?: FederatedLearningRequestStatus
  ): Observable<PaginatedResponse<RequestRunMetricsDto>> {
    let queryParam = new HttpParams();
    if (page !== undefined) queryParam = queryParam.set('page', page);
    if (pageSize !== undefined) queryParam = queryParam.set('page_size', pageSize);
    if (status) queryParam = queryParam.set('status', status.toUpperCase());

    return this.apiService.get<PaginatedResponse<RequestRunMetricsDto>>(this.getBaseUrl(), queryParam).pipe(
      catchError((err) => this.errorSnackbarService.showSnackBar(
        err,
        this.translate.instant('ERROR.FAILED_TO_FETCH', {name: 'metrics requests'})
      ))
    );
  }

  updateRequest(
    request: RequestRunMetricsDto,
    status: FederatedLearningRequestStatus
  ): Observable<RequestRunMetricsDto> {
    return this.apiService.put<RequestRunMetricsDto>(`${this.getBaseUrl()}/${request.id}`, {
      ...request,
      status,
    }).pipe(
      catchError((err) => this.errorSnackbarService.showSnackBar(
        err,
        this.translate.instant('ERROR.FAILED_TO_UPDATE', {name: `metrics request ${request.id}`})
      ))
    );
  }

  private getBaseUrl(): string {
    return `${this.apiUrl}/${this.path}`;
  }
}
