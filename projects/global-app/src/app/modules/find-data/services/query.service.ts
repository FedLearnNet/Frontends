import {inject, Injectable} from '@angular/core';
import {
  catchError,
  expand, from,
  Observable,
  switchMap,
  throwError,
  timer
} from 'rxjs';
import {ApiService} from '@shared-lib/services/api.service';
import {environment} from '@global-app/env/environment';
import {QueryResultStatus} from '@global-app/find-data/enums';
import {CreateQueryDTO, QueryDTO} from "@global-app/find-data/dto/query";
import {MatSnackBar} from "@angular/material/snack-bar";
import {EventSourcePolyfill} from "ng-event-source";
import {KeycloakService} from "keycloak-angular";
import {HttpParams} from "@angular/common/http";
import {ApiErrorSnackbarService} from "@shared-lib/services/api-error-snackbar.service";

@Injectable({
  providedIn: 'root'
})
export class QueryService {
  private readonly keycloakService: KeycloakService = inject(KeycloakService);
  private readonly apiService: ApiService = inject(ApiService);
  private readonly snackBar: MatSnackBar = inject(MatSnackBar);
  private readonly errorSnackbarService: ApiErrorSnackbarService = inject(ApiErrorSnackbarService);
  private readonly apiUrl: string = environment.queryControllerApiUrl!;
  private readonly path = 'query'

  createQuery(query: CreateQueryDTO): Observable<QueryDTO> {
    return this.apiService.post<QueryDTO>(`${this.getBaseUrl()}`, query)
      .pipe(
        catchError((err) => this.errorSnackbarService.showSnackBar(err,
          'Failed to create query')),
      );
  }

  updateQuery(query: QueryDTO): Observable<QueryDTO> {
    return this.apiService.put<QueryDTO>(`${this.getBaseUrl()}/${query.id}`, query)
      .pipe(
        catchError((err) => this.errorSnackbarService.showSnackBar(err,
          'Failed to update query')),
      );
  }


  createAndRunQuery(query: CreateQueryDTO): Observable<QueryDTO> {
    return this.apiService.post<QueryDTO>(`${this.getBaseUrl()}/fire`, query)
      .pipe(
        catchError((err) => this.errorSnackbarService.showSnackBar(err,
          'Failed to create and run query')),
      );
  }


  getAllQueriesSSE(): Observable<QueryDTO> {
    return from(this.keycloakService.getToken()).pipe(
      switchMap(token => {
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
      })
    );
  }

  get(id: number): Observable<QueryDTO> {
    return this.apiService.get<QueryDTO>(`${this.getBaseUrl()}/${id}`).pipe(
      catchError((err) => this.errorSnackbarService.showSnackBar(err,
        'Failed to get query')),
    );
  }

  getAllQueries(hasNoProject?: boolean): Observable<QueryDTO[]> {
    let queryParam = new HttpParams();
    if (hasNoProject) {
      queryParam = queryParam.set('has-no-project', hasNoProject)
    }
    return this.apiService.get<QueryDTO[]>(this.getBaseUrl(), queryParam) .pipe(
      catchError((err) => this.errorSnackbarService.showSnackBar(err,
        'Failed to get all query')),
    );
  }

  fireQuery(queryId: number): Observable<QueryDTO> {
    return this.apiService.post<QueryDTO>(`${this.getBaseUrl()}/${queryId}/fire`, {})
      .pipe(
        catchError((err) => this.errorSnackbarService.showSnackBar(err,
          'Failed to fire query')),
      );
  }

  private getBaseUrl(): string {
    return `${this.apiUrl}/${this.path}`;
  }

  deleteQuery(queryId: number): Observable<any> {
    return this.apiService.delete<any>(`${this.getBaseUrl()}/${queryId}`)
      .pipe(
        catchError((err) => this.errorSnackbarService.showSnackBar(err,
          'Failed to delete query')),
      );
  }

}
