import {inject, Injectable} from "@angular/core";
import {ApiService} from "@shared-lib/services/api.service";
import {HttpParams} from "@angular/common/http";
import {catchError, map, Observable} from "rxjs";
import {environment} from "@local-app/env/environment";
import {ApiErrorSnackbarService} from "@shared-lib/services/api-error-snackbar.service";
import {LogPage} from "../dto/page";
import {PatientDataTraceabilityLogDto, PatientLearningQuery, PatientQueryLogDto} from "../dto/logs";
import {SortDirection} from "@angular/material/sort";
import {QueryInfoDto} from "../dto/query";
import {FederatedLearningRequestPatientsDto} from "@local-app/data-review/dto/federated-learning-request";

@Injectable({
  providedIn: 'root'
})
export class LogService {
  private readonly errorSnackbarService: ApiErrorSnackbarService = inject(ApiErrorSnackbarService);
  private readonly apiService: ApiService = inject(ApiService);
  private readonly apiUrl = `${environment.clientMetaApiUrl}/client_meta_api`;


  public getPatientDataTraceabilityLog(sort: string,
                                       order: SortDirection,
                                       page: number,
                                       pageSize: number,
                                       search?: string,
                                       filter?: {
                                         [key: string]: string
                                       }): Observable<LogPage<PatientDataTraceabilityLogDto>> {
    if (page === 0) {
      page = 1;
    }
    let queryParam = new HttpParams();
    queryParam = queryParam.set('page', page)
    queryParam = queryParam.set('page_size', pageSize)
    if (sort) {
      const orderString = order === 'asc' ? '' : '-';
      queryParam = queryParam.set('ordering', orderString + sort)
    }
    if (search) {
      queryParam = queryParam.set('search', search)
    }
    if (filter) {
      Object.keys(filter).forEach(key => {
        queryParam = queryParam.set(key, filter[key])
      });
    }
    return this.apiService.get<LogPage<PatientDataTraceabilityLogDto>>(this.getBaseUrl("logs/"), queryParam)
      .pipe(
        catchError((err) => this.errorSnackbarService.showSnackBar(err,
          'Failed to fetch update log')),
      );
  }

  public getPatientDataLearningLog(sort: string,
                                   order: SortDirection,
                                   page: number,
                                   pageSize: number,
                                   search?: string,
                                   filter?: {
                                     [key: string]: string
                                   }): Observable<LogPage<PatientLearningQuery>> {
    let queryParam = new HttpParams();
    if (page === 0) {
      page = 1;
    }
    queryParam = queryParam.set('page', page)
    queryParam = queryParam.set('page_size', pageSize)
    if (sort) {
      const orderString = order === 'asc' ? '' : '-';
      queryParam = queryParam.set('ordering', orderString + sort)
    }
    if (search) {
      queryParam = queryParam.set('search', search)
    }
    if (filter) {
      Object.keys(filter).forEach(key => {
        queryParam = queryParam.set(key, filter[key])
      });
    }
    return this.apiService.get<LogPage<FederatedLearningRequestPatientsDto>>(this.getBaseUrl("federated-learning-request-data/"), queryParam)
      .pipe(
        map(rpg => {
            const data: PatientLearningQuery[] = [];
            rpg.results.forEach(r => {
              r.patientIds.forEach(p => {
                data.push({
                  patientId: p,
                  cohortId: r.cohortId
                })
              })
            })

            return {
              count: data.length,
              next: rpg.next,
              previous: rpg.previous,
              results: data
            };
          }
        ),
        catchError((err) => this.errorSnackbarService.showSnackBar(err,
          'Failed to fetch update log'))
      );
  }


  public getPatientQueryLog(sort: string,
                            order: SortDirection,
                            page: number,
                            pageSize: number,
                            search?: string): Observable<LogPage<PatientQueryLogDto>> {
    if (page === 0) {
      page = 1;
    }
    let queryParam = new HttpParams();
    queryParam = queryParam.set('page', page)
    queryParam = queryParam.set('page_size', pageSize)
    if (sort) {
      const orderString = order === 'asc' ? '' : '-';
      queryParam = queryParam.set('ordering', orderString + sort)
    }
    if (search) {
      queryParam = queryParam.set('search', search)
    }
    return this.apiService.get<LogPage<PatientQueryLogDto>>(this.getBaseUrl("queries/"), queryParam)
      .pipe(
        catchError((err) => this.errorSnackbarService.showSnackBar(err,
          'Failed to fetch query log')),
      );
  }

  public getQueryInfos(): Observable<QueryInfoDto[]> {
    return this.apiService.get<QueryInfoDto[]>(this.getBaseUrl("queryinfo/"))
      .pipe(
        catchError((err) => this.errorSnackbarService.showSnackBar(err,
          'Failed to fetch queryinfo')),
      );
  }

  public getQueryInfo(id?: number): Observable<QueryInfoDto> {
    return this.apiService.get<QueryInfoDto>(this.getBaseUrl("queryinfo/") + id + "/")
      .pipe(
        catchError((err) => this.errorSnackbarService.showSnackBar(err,
          'Failed to fetch queryinfo')),
      );
  }


  private getBaseUrl(path: string): string {
    return `${this.apiUrl}/${path}`;
  }
}
