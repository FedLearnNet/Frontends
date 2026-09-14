import {inject, Injectable} from '@angular/core';
import {catchError, Observable} from 'rxjs';
import {TranslateService} from '@ngx-translate/core';
import {ApiErrorSnackbarService} from "@shared-lib/services/api-error-snackbar.service";
import {ApiService} from '@shared-lib/services/api.service';
import {environment} from '@local-app/env/environment';
import {LocalDataStatisticsDto} from "@local-app/cohort/dto/data-statistics";

@Injectable({
  providedIn: 'root'
})
export class CohortStatisticsService {
  private readonly apiService: ApiService = inject(ApiService);
  private readonly errorSnackbarService: ApiErrorSnackbarService = inject(ApiErrorSnackbarService);
  private readonly translate: TranslateService = inject(TranslateService);

  private readonly apiUrl = environment.localLearningAPIURL;
  private readonly path = 'datastatistics';

  getStatisticsForAll(): Observable<LocalDataStatisticsDto> {
    return this.apiService.get<LocalDataStatisticsDto>(this.getBaseUrl()).pipe(
      catchError((err) => this.errorSnackbarService.showSnackBar(
        err,
        this.translate.instant('ERROR.FAILED_TO_FETCH', {name: this.translate.instant('GRID.STATISTICS').toLowerCase()})
      ))
    );
  }

  getStatisticsForCohort(cohortId: number): Observable<LocalDataStatisticsDto> {
    return this.apiService.get<LocalDataStatisticsDto>(`${this.getBaseUrl()}/cohort/${cohortId}`).pipe(
      catchError((err) => this.errorSnackbarService.showSnackBar(
        err,
        this.translate.instant('ERROR.FAILED_TO_FETCH', {name: this.translate.instant('GRID.STATISTICS').toLowerCase()})
      ))
    );
  }

  private getBaseUrl(): string {
    return `${this.apiUrl}/${this.path}`;
  }
}
