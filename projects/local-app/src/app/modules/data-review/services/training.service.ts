import {PaginatedResponse} from './../../../../../../shared-lib/src/lib/models/paginated-response';
import {inject, Injectable} from '@angular/core';
import {TrainingStatus} from '@local-app/data-review/models';
import {catchError, Observable} from 'rxjs';
import {ApiService} from '@shared-lib/services/api.service';
import {environment} from '@local-app/env/environment';
import {ApiErrorSnackbarService} from "@shared-lib/services/api-error-snackbar.service";
import {
  FederatedLearningRequestDto,
  FederatedLearningRequestPatientsDto
} from "@local-app/data-review/dto/federated-learning-request";
import {HttpParams} from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class TrainingService {
  private readonly errorSnackbarService: ApiErrorSnackbarService = inject(ApiErrorSnackbarService);
  private readonly apiService: ApiService = inject(ApiService);
  private readonly apiUrl = `${environment.clientMetaApiUrl}/client_meta_api`;
  private readonly path = 'federated-learning-request/'

  getAllTrainings(page?: number, pageSize?: number, status?: TrainingStatus): Observable<PaginatedResponse<FederatedLearningRequestDto>> {
    let queryParam = new HttpParams();
    if (page) {
      queryParam = queryParam.set('page', page);
    }
    if (pageSize) {
      queryParam = queryParam.set('page_size', pageSize);
    }
    if (status) {
      queryParam = queryParam.set('fl_request_status', status);
    }

    return this.apiService.get<PaginatedResponse<FederatedLearningRequestDto>>(`${this.getBaseUrl()}`, queryParam)
      .pipe(
        catchError((err) => this.errorSnackbarService.showSnackBar(err,
          'Failed to fetch all training requests'))
      );
  }

  updateTrainingStatus(
    id: number,
    status: TrainingStatus,
    requestPatients?: FederatedLearningRequestPatientsDto[]
  ): Observable<FederatedLearningRequestDto> {
    return this.apiService.patch<FederatedLearningRequestDto>(`${this.getBaseUrl()}${id}/`, {
      status: status,
      request_patients: requestPatients
    }).pipe(
      catchError((err) => this.errorSnackbarService.showSnackBar(err,
        'Failed to update training status with id: ' + id))
    );
  }


  private getBaseUrl(): string {
    return `${this.apiUrl}/${this.path}`;
  }
}
