import {inject, Injectable} from '@angular/core';
import {catchError, Observable,} from 'rxjs';
import {ApiService} from '@shared-lib/services/api.service';
import {environment} from '@global-app/env/environment';
import {CreateQueryDTO, QueryDetailDTO, QueryDTO} from "@global-app/find-data/dto/query";
import {EventSourcePolyfill} from "ng-event-source";
import {HttpParams} from "@angular/common/http";
import {ApiErrorSnackbarService} from "@shared-lib/services/api-error-snackbar.service";
import {TranslateService} from '@ngx-translate/core';
import Keycloak from "keycloak-js";

@Injectable({
  providedIn: 'root'
})
export class QueryService {
  private readonly keycloakService: Keycloak = inject(Keycloak);
  private readonly apiService: ApiService = inject(ApiService);
  private readonly errorSnackbarService: ApiErrorSnackbarService = inject(ApiErrorSnackbarService);
  private readonly apiUrl: string = environment.globalLearningApiUrl!;
  private readonly path = 'query'
  private readonly translate: TranslateService = inject(TranslateService);

  createQuery(query: CreateQueryDTO): Observable<QueryDTO> {
    return this.apiService.post<QueryDTO>(`${this.getBaseUrl()}`, query)
      .pipe(
        catchError((err) => this.errorSnackbarService.showSnackBar(err,
          this.translate.instant('ERROR.FAILED_TO_CREATE', {name: this.translate.instant('GRID.QUERY').toLowerCase()}))),
      );
  }

  updateQuery(query: QueryDTO): Observable<QueryDTO> {
    return this.apiService.put<QueryDTO>(`${this.getBaseUrl()}/${query.id}`, query)
      .pipe(
        catchError((err) => this.errorSnackbarService.showSnackBar(err,
          this.translate.instant('ERROR.FAILED_TO_UPDATE', {name: this.translate.instant('GRID.QUERY').toLowerCase()})))
      );
  }


  createAndRunQuery(query: CreateQueryDTO): Observable<QueryDTO> {
    return this.apiService.post<QueryDTO>(`${this.getBaseUrl()}/fire`, query)
      .pipe(
        catchError((err) => this.errorSnackbarService.showSnackBar(err,
          this.translate.instant('ERROR.FAILED_TO_CREATE_AND_RUN', {name: this.translate.instant('GRID.QUERY').toLowerCase()}))),
      );
  }


  getAllQueriesSSE(): Observable<QueryDTO> {
    const token = this.keycloakService.token;
    return new Observable<QueryDTO>((observer) => {
      const eventSource = new EventSourcePolyfill(this.getBaseUrl() + '/sse', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      eventSource.onmessage = (event) => {
        try {
          const data: QueryDTO = JSON.parse(event.data);
          observer.next(data);
        } catch (error) {
          observer.error(error);
        }
      };
      eventSource.onerror = (error: any) => {
        console.error('Failed to enable query update stream', error);
        observer.error(error);
        eventSource.close();
      };
      return () => {
        eventSource.close();
      };
    });
  }

  get(id: number): Observable<QueryDetailDTO> {
    return this.apiService.get<QueryDetailDTO>(`${this.getBaseUrl()}/${id}`).pipe(
      catchError((err) => this.errorSnackbarService.showSnackBar(err,
        this.translate.instant('ERROR.FAILED_TO_GET', {name: this.translate.instant('GRID.QUERY').toLowerCase()}))),
    );
  }

  getAllQueries(hasNoProject?: boolean): Observable<QueryDTO[]> {
    let queryParam = new HttpParams();
    if (hasNoProject) {
      queryParam = queryParam.set('has-no-project', hasNoProject)
    }
    return this.apiService.get<QueryDTO[]>(this.getBaseUrl(), queryParam).pipe(
      catchError((err) => this.errorSnackbarService.showSnackBar(err,
        this.translate.instant('ERROR.FAILED_TO_GET', {name: this.translate.instant('GRID.ALL_QUERY').toLowerCase()}))),
    );
  }

  fireQuery(queryId: number): Observable<QueryDTO> {
    return this.apiService.post<QueryDTO>(`${this.getBaseUrl()}/${queryId}/fire`, {})
      .pipe(
        catchError((err) => this.errorSnackbarService.showSnackBar(err,
          this.translate.instant('ERROR.FAILED_TO_FIRE', {name: this.translate.instant('GRID.QUERY').toLowerCase()}))),
      );
  }

  fireDataStatistics(queryId: number): Observable<QueryDTO> {
    return this.apiService.post<QueryDTO>(`${this.getBaseUrl()}/${queryId}/fire-data-statistics`, {})
      .pipe(
        catchError((err) => this.errorSnackbarService.showSnackBar(err,
          this.translate.instant('ERROR.FAILED_TO_FIRE', {name: this.translate.instant('GRID.STATISTICS').toLowerCase()}))),
      );
  }

  private getBaseUrl(): string {
    return `${this.apiUrl}/${this.path}`;
  }

  deleteQuery(queryId: number): Observable<any> {
    return this.apiService.delete<any>(`${this.getBaseUrl()}/${queryId}`)
      .pipe(
        catchError((err) => this.errorSnackbarService.showSnackBar(err,
          this.translate.instant('ERROR.FAILED_TO_DELETE', {name: this.translate.instant('GRID.QUERY').toLowerCase()}))),
      );
  }

}
