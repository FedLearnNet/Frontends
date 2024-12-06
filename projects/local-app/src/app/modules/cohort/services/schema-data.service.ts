import {inject, Injectable} from '@angular/core';
import { ApiService } from '@shared-lib/services/api.service';
import { environment } from '@local-app/env/environment';
import {catchError, Observable, of} from 'rxjs';
import { buildQueryString } from '@shared-lib/utils';
import { SchemaDataResponse } from '@local-app/cohort/models';
import {ApiErrorSnackbarService} from "@shared-lib/services/api-error-snackbar.service";

@Injectable({
  providedIn: 'root'
})
export class SchemaDataService {
  private readonly errorSnackbarService: ApiErrorSnackbarService = inject(ApiErrorSnackbarService);

  private readonly apiUrl;
  private readonly path = 'data'

  constructor(
      private apiService: ApiService,
  ) {
    this.apiUrl = environment.harmonizedApiUrl;
  }

  getAllSchemaData(schemaId: string | null, page: number | null = null, pageSize: number | null = null): Observable<SchemaDataResponse> {
    if (!schemaId) return of();

    return this.apiService.
    get<SchemaDataResponse>(`${this.getBaseUrl(schemaId)}/?${buildQueryString({page: page, page_size: pageSize})}`)
      .pipe(
        catchError((err) => this.errorSnackbarService.showSnackBar(err,
          'Failed to fetch all patients')),
      );
  }

  getSchemaData(schemaId: string, dataId: string): Observable<any> {
    return this.apiService.get<any>(`${this.getBaseUrl(schemaId)}/${dataId}`)
      .pipe(
        catchError((err) => this.errorSnackbarService.showSnackBar(err,
          'Failed to fetch projects')),
      );
  }

  submitSchemaData(schemaId: string, data: any): Observable<any> {
    return this.apiService.post<any>(`${this.getBaseUrl(schemaId)}/`, data)
      .pipe(
        catchError((err) => this.errorSnackbarService.showSnackBar(err,
          'Fail to submit patient data')),
      );
  }

  updateSchemaData(schemaId: string, dataId: string, data: any): Observable<any> {
    return this.apiService.put<any>(`${this.getBaseUrl(schemaId)}/${dataId}/`, data)
      .pipe(
        catchError((err) => this.errorSnackbarService.showSnackBar(err,
          'Failed to update patient data')),
      );
  }

  deleteSchemaData(schemaId: string, dataId: string): Observable<any> {
    return this.apiService.delete<any>(`${this.getBaseUrl(schemaId)}/${dataId}/`)
      .pipe(
        catchError((err) => this.errorSnackbarService.showSnackBar(err,
          'Failed to delete patient')),
      );
  }

  private getBaseUrl(schemaId: string): string {
    return `${this.apiUrl}/${schemaId}/${this.path}`;
  }
}
