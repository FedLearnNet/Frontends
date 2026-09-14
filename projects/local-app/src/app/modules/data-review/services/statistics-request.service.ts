import {inject, Injectable} from '@angular/core';
import {HttpParams} from "@angular/common/http";
import {catchError, Observable} from 'rxjs';
import {TranslateService} from '@ngx-translate/core';
import {PaginatedResponse} from '@shared-lib/models';
import {ApiService} from "@shared-lib/services/api.service";
import {ApiErrorSnackbarService} from "@shared-lib/services/api-error-snackbar.service";
import {environment} from "@local-app/env/environment";
import {FederatedLearningRequestStatus} from "@local-app/data-review/dto/federated-learning-request";
import {RequestDataStatisticsDto} from "@local-app/data-review/dto/request-data-statistics";

@Injectable({
  providedIn: 'root'
})
export class StatisticsRequestService {
  private readonly errorSnackbarService: ApiErrorSnackbarService = inject(ApiErrorSnackbarService);
  private readonly apiService: ApiService = inject(ApiService);
  private readonly translate: TranslateService = inject(TranslateService);
  private readonly apiUrl = environment.localLearningAPIURL;
  private readonly path = 'datastatistics/requests';

  getAllRequests(
    page?: number,
    pageSize?: number,
    status?: FederatedLearningRequestStatus,
    patientId?: number,
  ): Observable<PaginatedResponse<RequestDataStatisticsDto>> {
    let queryParam = new HttpParams();
    if (page !== undefined) {
      queryParam = queryParam.set('page', page);
    }
    if (pageSize !== undefined) {
      queryParam = queryParam.set('page_size', pageSize);
    }
    if (status) {
      queryParam = queryParam.set('status', status.toUpperCase());
    }
    if (patientId !== undefined) {
      queryParam = queryParam.set('patient_id', patientId);
    }

    return this.apiService.get<PaginatedResponse<RequestDataStatisticsDto>>(this.getBaseUrl(), queryParam).pipe(
      catchError((err) => this.errorSnackbarService.showSnackBar(
        err,
        this.translate.instant('ERROR.FAILED_TO_FETCH', {
          name: this.translate.instant('GRID.ALL_STATISTICS_REQUESTS').toLowerCase()
        })
      ))
    );
  }

  updateRequest(
    request: RequestDataStatisticsDto,
    status: FederatedLearningRequestStatus
  ): Observable<RequestDataStatisticsDto> {
    return this.apiService.put<RequestDataStatisticsDto>(`${this.getBaseUrl()}/${request.id}`, {
      ...request,
      status,
      cohortIds: request.cohortIds ?? [],
      patientIds: request.patientIds ?? []
    }).pipe(
      catchError((err) => this.errorSnackbarService.showSnackBar(
        err,
        this.translate.instant('ERROR.FAILED_TO_UPDATE', {
          name: this.translate.instant('GRID.STATISTICS_REQUEST').toLowerCase() + `: ${request.id}`
        })
      ))
    );
  }

  private getBaseUrl(): string {
    return `${this.apiUrl}/${this.path}`;
  }
}
