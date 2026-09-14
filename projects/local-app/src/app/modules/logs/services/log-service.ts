import { inject, Injectable } from "@angular/core";
import { ApiService } from "@shared-lib/services/api.service";
import { HttpParams } from "@angular/common/http";
import { catchError, Observable } from "rxjs";
import { environment } from "@local-app/env/environment";
import { ApiErrorSnackbarService } from "@shared-lib/services/api-error-snackbar.service";
import { LogPage } from "../dto/page";
import {
  PatientDataTraceabilityDetailLogDto,
  PatientDataTraceabilityLogDto,
  PatientQueryLogDto,
  RunStatisticsDto
} from "../dto/logs";
import { SortDirection } from "@angular/material/sort";
import { LocalQueryDto } from "../dto/query";
import { PatientLearningDto } from "@local-app/data-review/dto/federated-learning-request";
import { TranslateService } from '@ngx-translate/core';
import { AuditFieldEnum, DEFAULT_SEARCHABLE_FIELDS, FILTER_TO_FIELD, FilterKeys } from "./log-service-filter-dto";
import { LoadLogData } from '../model/log-wrapper';

@Injectable({
  providedIn: 'root'
})
export class LogService {
  private readonly translate: TranslateService = inject(TranslateService);
  private readonly errorSnackbarService: ApiErrorSnackbarService = inject(ApiErrorSnackbarService);
  private readonly apiService: ApiService = inject(ApiService);
  private readonly apiUrl = environment.localLearningAPIURL;

  public getPatientDataTraceabilityLog(
      page: number,
      pageSize: number,
      sort: AuditFieldEnum = AuditFieldEnum.REVISION_TIMESTAMP,
      order: 'asc' | 'desc' = 'desc',
      cohortId?: number,
      search?: string | string[],
      filter?: Partial<Record<FilterKeys, string>>,
      externalPatientId?: string
  ): Observable<LogPage<PatientDataTraceabilityLogDto>> {

    const params = this.buildTraceabilityParams({
      page,
      pageSize,
      sort,
      order,
      cohortId,
      search,
      filter,
      externalPatientId
    });

    return this.apiService
        .get<LogPage<PatientDataTraceabilityLogDto>>(this.getBaseUrl('cohort/logs'), params)
        .pipe(
            catchError(err =>
                this.errorSnackbarService.showSnackBar(
                    err,
                    this.translate.instant('ERROR.FAILED_TO_FETCH', {
                      name: this.translate.instant('GRID.UPDATE_LOG').toLowerCase(),
                    }),
                )
            )
        );
  }

  public getPatientDataTraceabilityLogDetail(patientId: number, revId: number): Observable<PatientDataTraceabilityDetailLogDto> {
    return this.apiService.get<PatientDataTraceabilityDetailLogDto>(`${this.getBaseUrl("cohort/logs")}/patient/${patientId}/rev/${revId}`)
      .pipe(
        catchError((err) => this.errorSnackbarService.showSnackBar(err,
          this.translate.instant('ERROR.FAILED_TO_FETCH', {name: this.translate.instant('GRID.UPDATE_LOG').toLowerCase()}))),
      );
  }


  public getPatientDataLearningLog({
       sort = '',
       order = '',
       page = 0,
       pageSize = 25,
       search = '',
       filter = [],
       patientId = undefined,
    }: LoadLogData): Observable<LogPage<PatientLearningDto>> {
    let queryParam = new HttpParams();
    queryParam = queryParam.set('page', page)
    queryParam = queryParam.set('page_size', pageSize!)
    if (sort) {
      const orderString = order === 'asc' ? '' : '-';
      queryParam = queryParam.set('ordering', orderString + sort)
    }
    if (search) {
      queryParam = queryParam.set('search', search)
    }
    if (filter) {
      Object.keys(filter).forEach((key: any) => {
        queryParam = queryParam.set(key, filter[key])
      });
    }
    if (patientId) {
      queryParam = queryParam.set('patient_id', patientId);
    }
    return this.apiService.get<LogPage<PatientLearningDto>>(this.getBaseUrl("patients/learning"), queryParam)
      .pipe(
        catchError((err) => this.errorSnackbarService.showSnackBar(err,
          this.translate.instant('ERROR.FAILED_TO_FETCH', {name: this.translate.instant('GRID.UPDATE_LOG').toLowerCase()})))
      );
  }


  public getPatientQueryLog(sort: string,
                            order: SortDirection,
                            page: number,
                            pageSize: number,
                            search?: string,
                            patientId?: number): Observable<LogPage<PatientQueryLogDto>> {
    let queryParam = new HttpParams();
    queryParam = queryParam.set('page', page)
    queryParam = queryParam.set('page_size', pageSize)
    if (sort) {
      const orderString = order === 'asc' ? '' : '-';
      queryParam = queryParam.set('ordering', orderString + sort);
    }
    if (search) {
      queryParam = queryParam.set('search', search);
    }
    if (patientId) {
      queryParam = queryParam.set('patient_id', patientId);
    }
    return this.apiService.get<LogPage<PatientQueryLogDto>>(this.getBaseUrl("patients/query"), queryParam)
      .pipe(
        catchError((err) => this.errorSnackbarService.showSnackBar(err,
          this.translate.instant('ERROR.FAILED_TO_FETCH', {name: this.translate.instant('GRID.QUERY_LOG').toLowerCase()}))),
      );
  }

  public getQueryInfos(): Observable<LocalQueryDto[]> {
    return this.apiService.get<LocalQueryDto[]>(this.getBaseUrl("query"))
      .pipe(
        catchError((err) => this.errorSnackbarService.showSnackBar(err,
          this.translate.instant('ERROR.FAILED_TO_FETCH', {name: this.translate.instant('GRID.QUERY_INFO').toLowerCase()}))),
      );
  }

  public getQueryInfo(id?: number): Observable<LocalQueryDto> {
    return this.apiService.get<LocalQueryDto>(this.getBaseUrl("query/") + id)
      .pipe(
        catchError((err) => this.errorSnackbarService.showSnackBar(err,
          this.translate.instant('ERROR.FAILED_TO_FETCH', {name: this.translate.instant('GRID.QUERY_INFO').toLowerCase()}))),
      );
  }

  public getRunStatistics(runId: number): Observable<RunStatisticsDto> {
      return this.apiService.get<RunStatisticsDto>(this.getBaseUrl(`cohort/logs/run/${runId}/statistics`)).pipe(
          catchError((err) => this.errorSnackbarService.showSnackBar(err,
              this.translate.instant('ERROR.FAILED_TO_FETCH', {name: this.translate.instant('ENTITY_OVERVIEW').toLowerCase()}))),
      );
  }

  private getBaseUrl(path: string): string {
    return `${this.apiUrl}/${path}`;
  }

  private buildTraceabilityParams(options: {
    page: number;
    pageSize: number;
    sort: AuditFieldEnum;
    order: 'asc' | 'desc';
    cohortId?: number;
    search?: string | string[];
    filter?: Partial<Record<FilterKeys, string>>;
    externalPatientId?: string;
  }): HttpParams {
    let params = new HttpParams()
        .set('page', String(options.page))
        .set('size', String(options.pageSize))
        .set('sort', options.sort)
        .set('direction', options.order.toUpperCase());

    if (options.cohortId) {
      params = params.set('cohortId', String(options.cohortId));
    }

    const { fields, terms } = this.buildSearchPairs(options);

    fields.forEach((field, i) => {
      params = params.append('search_fields', field);
      params = params.append('search_terms', terms[i]);
    });

    return params;
  }

  private buildSearchPairs(options: {
    search?: string | string[];
    filter?: Partial<Record<FilterKeys, string>>;
    externalPatientId?: string;
    cohortId?: number;
  }): { fields: AuditFieldEnum[]; terms: string[] } {
    const fields: AuditFieldEnum[] = [];
    const terms: string[] = [];

    if (options.filter) {
      for (const key of Object.keys(options.filter) as FilterKeys[]) {
        const value = options.filter[key];
        if (value !== undefined && value !== null) {
          fields.push(FILTER_TO_FIELD[key]);
          terms.push(value);
        }
      }
    }

    if (options.cohortId) {
      fields.push(AuditFieldEnum.COHORT_ID);
      terms.push(String(options.cohortId));
    }

    if (options.externalPatientId) {
      fields.push(AuditFieldEnum.EXTERNAL_PATIENT_ID);
      terms.push(options.externalPatientId);
    }

    const addSearchTerm = (term: string) => {
      if (term.trim()) {
        DEFAULT_SEARCHABLE_FIELDS.forEach(f => {
          fields.push(f);
          terms.push(term.trim());
        });
      }
    };

    if (typeof options.search === 'string') {
      addSearchTerm(options.search);
    } else if (Array.isArray(options.search)) {
      options.search.filter(Boolean).forEach(addSearchTerm);
    }

    return { fields, terms };
  }
}
