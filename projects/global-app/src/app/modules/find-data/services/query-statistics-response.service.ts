import {inject, Injectable} from '@angular/core';
import {catchError, Observable} from 'rxjs';
import {TranslateService} from '@ngx-translate/core';
import {ApiService} from '@shared-lib/services/api.service';
import {ApiErrorSnackbarService} from '@shared-lib/services/api-error-snackbar.service';
import {environment} from '@global-app/env/environment';
import {DataStatisticsResponseDTO} from "@global-app/find-data/dto/query-statistics";

@Injectable({
  providedIn: 'root'
})
export class QueryStatisticsResponseService {
  private readonly apiService = inject(ApiService);
  private readonly errorSnackbarService = inject(ApiErrorSnackbarService);
  private readonly translate = inject(TranslateService);
  private readonly apiUrl = environment.globalLearningApiUrl!;
  private readonly path = 'query/data-statistics';

  listForQuery(queryId: number): Observable<DataStatisticsResponseDTO[]> {
    return this.apiService.get<DataStatisticsResponseDTO[]>(`${this.getBaseUrl()}/query/${queryId}`).pipe(
      catchError((err) => this.errorSnackbarService.showSnackBar(
        err,
        this.translate.instant('ERROR.FAILED_TO_FETCH', {name: this.translate.instant('GRID.STATISTICS').toLowerCase()})
      ))
    );
  }

  listForRequest(requestId: string): Observable<DataStatisticsResponseDTO[]> {
    return this.apiService.get<DataStatisticsResponseDTO[]>(`${this.getBaseUrl()}/request/${requestId}`).pipe(
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
