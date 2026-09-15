import {PaginatedResponse} from '@shared-lib/models';
import {inject, Injectable} from '@angular/core';
import {catchError, Observable} from 'rxjs';
import {ApiService} from '@shared-lib/services/api.service';
import {environment} from '@local-app/env/environment';
import {ApiErrorSnackbarService} from "@shared-lib/services/api-error-snackbar.service";
import {
  FederatedLearningRequestDto,
  FederatedLearningRequestStatus,
  PatientLearningDto
} from "@local-app/data-review/dto/federated-learning-request";
import {HttpParams} from "@angular/common/http";
import {TranslateService} from '@ngx-translate/core';

@Injectable({
  providedIn: 'root'
})
export class TrainingService {
  private readonly errorSnackbarService: ApiErrorSnackbarService = inject(ApiErrorSnackbarService);
  private readonly apiService: ApiService = inject(ApiService);
  private readonly translate: TranslateService = inject(TranslateService);
  private readonly apiUrl = environment.localLearningAPIURL;
  private readonly path = 'learning/requests'

  getAllTrainings(page?: number, pageSize?: number, status?: FederatedLearningRequestStatus): Observable<PaginatedResponse<FederatedLearningRequestDto>> {
    let queryParam = new HttpParams();
    if (page) {
      queryParam = queryParam.set('page', page);
    }
    if (pageSize) {
      queryParam = queryParam.set('page_size', pageSize);
    }
    if (status) {
      queryParam = queryParam.set('status', status.toUpperCase());
    }

    return this.apiService.get<PaginatedResponse<FederatedLearningRequestDto>>(`${this.getBaseUrl()}`, queryParam)
      .pipe(
        catchError((err) => this.errorSnackbarService.showSnackBar(err,
          this.translate.instant('ERROR.FAILED_TO_FETCH', {name: this.translate.instant('GRID.ALL_TRAINING_REQUESTS').toLowerCase()})))
      );
  }

  getTraining(id: number): Observable<FederatedLearningRequestDto> {
    return this.apiService.get<FederatedLearningRequestDto>(`${this.getBaseUrl()}/${id}`)
      .pipe(
        catchError((err) => this.errorSnackbarService.showSnackBar(err,
          this.translate.instant('ERROR.FAILED_TO_FETCH', {name: this.translate.instant('GRID.TRAINING_STATUS').toLowerCase() + `: ${id}`})))
      );
  }

  updateTrainingStatus(
    id: number,
    status: FederatedLearningRequestStatus,
    requestPatients?: PatientLearningDto[],
    modelCanBePublic?: boolean
  ): Observable<FederatedLearningRequestDto> {
    return this.apiService.put<FederatedLearningRequestDto>(`${this.getBaseUrl()}/${id}`, {
      status: status,
      requestPatients: requestPatients,
      modelCanBePublic: modelCanBePublic
    }).pipe(
      catchError((err) => this.errorSnackbarService.showSnackBar(err,
        this.translate.instant('ERROR.FAILED_TO_UPDATE', {name: this.translate.instant('GRID.TRAINING_STATUS').toLowerCase() + `: ${id}`})))
    );
  }


  private getBaseUrl(): string {
    return `${this.apiUrl}/${this.path}`;
  }
}
