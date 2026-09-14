import {inject, Injectable} from '@angular/core';
import {catchError, Observable} from 'rxjs';
import {TranslateService} from '@ngx-translate/core';
import {ApiErrorSnackbarService} from "@shared-lib/services/api-error-snackbar.service";
import {ApiService} from '@shared-lib/services/api.service';
import {environment} from '@local-app/env/environment';
import {
  CreateCustomStatisticDto,
  CreateCustomStatisticsDashboardDto,
  CustomStatisticDto,
  CustomStatisticsDashboardDto,
} from "@local-app/cohort/dto/custom-statistics";

@Injectable({
  providedIn: 'root'
})
export class CustomStatisticsService {
  private readonly apiService: ApiService = inject(ApiService);
  private readonly errorSnackbarService: ApiErrorSnackbarService = inject(ApiErrorSnackbarService);
  private readonly translate: TranslateService = inject(TranslateService);

  private readonly apiUrl = environment.localLearningAPIURL;
  private readonly dashboardPath = 'customstatisticsdashboard';
  private readonly statisticPath = 'customstatistics';

  listDashboards(cohortId: number): Observable<CustomStatisticsDashboardDto[]> {
    return this.apiService.get<CustomStatisticsDashboardDto[]>(`${this.getDashboardUrl()}/cohort/${cohortId}`).pipe(
      catchError((err) => this.errorSnackbarService.showSnackBar(
        err,
        this.translate.instant('ERROR.FAILED_TO_FETCH', {name: 'custom statistics dashboards'})
      ))
    );
  }

  createDashboard(dto: CreateCustomStatisticsDashboardDto): Observable<CustomStatisticsDashboardDto> {
    return this.apiService.post<CustomStatisticsDashboardDto>(this.getDashboardUrl(), dto).pipe(
      catchError((err) => this.errorSnackbarService.showSnackBar(
        err,
        this.translate.instant('ERROR.FAILED_TO_CREATE', {name: 'custom statistics dashboard'})
      ))
    );
  }

  updateDashboard(id: number, dto: CustomStatisticsDashboardDto): Observable<CustomStatisticsDashboardDto> {
    return this.apiService.put<CustomStatisticsDashboardDto>(`${this.getDashboardUrl()}/${id}`, dto).pipe(
      catchError((err) => this.errorSnackbarService.showSnackBar(
        err,
        this.translate.instant('ERROR.FAILED_TO_UPDATE', {name: 'custom statistics dashboard'})
      ))
    );
  }

  deleteDashboard(id: number): Observable<void> {
    return this.apiService.delete<void>(`${this.getDashboardUrl()}/${id}`).pipe(
      catchError((err) => this.errorSnackbarService.showSnackBar(
        err,
        this.translate.instant('ERROR.FAILED_TO_DELETE', {name: 'custom statistics dashboard'})
      ))
    );
  }

  list(dashboardId: number): Observable<CustomStatisticDto[]> {
    return this.apiService.get<CustomStatisticDto[]>(`${this.getStatisticUrl()}/dashboard/${dashboardId}`).pipe(
      catchError((err) => this.errorSnackbarService.showSnackBar(
        err,
        this.translate.instant('ERROR.FAILED_TO_FETCH', {name: 'custom statistics'})
      ))
    );
  }

  get(id: number): Observable<CustomStatisticDto> {
    return this.apiService.get<CustomStatisticDto>(`${this.getStatisticUrl()}/${id}`).pipe(
      catchError((err) => this.errorSnackbarService.showSnackBar(
        err,
        this.translate.instant('ERROR.FAILED_TO_FETCH', {name: 'custom statistic'})
      ))
    );
  }

  create(dto: CreateCustomStatisticDto): Observable<CustomStatisticDto> {
    return this.apiService.post<CustomStatisticDto>(this.getStatisticUrl(), dto).pipe(
      catchError((err) => this.errorSnackbarService.showSnackBar(
        err,
        this.translate.instant('ERROR.FAILED_TO_CREATE', {name: 'custom statistic'})
      ))
    );
  }

  update(id: number, dto: CustomStatisticDto): Observable<CustomStatisticDto> {
    return this.apiService.put<CustomStatisticDto>(`${this.getStatisticUrl()}/${id}`, dto).pipe(
      catchError((err) => this.errorSnackbarService.showSnackBar(
        err,
        this.translate.instant('ERROR.FAILED_TO_UPDATE', {name: 'custom statistic'})
      ))
    );
  }

  delete(id: number): Observable<void> {
    return this.apiService.delete<void>(`${this.getStatisticUrl()}/${id}`).pipe(
      catchError((err) => this.errorSnackbarService.showSnackBar(
        err,
        this.translate.instant('ERROR.FAILED_TO_DELETE', {name: 'custom statistic'})
      ))
    );
  }

  private getDashboardUrl(): string {
    return `${this.apiUrl}/${this.dashboardPath}`;
  }

  private getStatisticUrl(): string {
    return `${this.apiUrl}/${this.statisticPath}`;
  }
}
