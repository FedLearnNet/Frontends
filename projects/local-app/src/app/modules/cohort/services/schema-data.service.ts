import { Injectable } from '@angular/core';
import { ApiService } from '@shared-lib/services/api.service';
import { environment } from '@local-app/env/environment';
import { Observable, of } from 'rxjs';
import { buildQueryString } from '@shared-lib/utils';
import { SchemaDataResponse } from '@local-app/cohort/models';

@Injectable({
  providedIn: 'root'
})
export class SchemaDataService {
  private readonly apiUrl;
  private readonly path = 'data'

  constructor(
      private apiService: ApiService,
  ) {
    this.apiUrl = environment.harmonizedApiUrl;
  }

  getAllSchemaData(schemaId: string | null, page: number | null = null, pageSize: number | null = null): Observable<SchemaDataResponse> {
    if (!schemaId) return of();

    return this.apiService.get<SchemaDataResponse>(`${this.getBaseUrl(schemaId)}/?${buildQueryString({page: page, page_size: pageSize})}`);
  }

  getSchemaData(schemaId: string, dataId: string): Observable<any> {
    return this.apiService.get<any>(`${this.getBaseUrl(schemaId)}/${dataId}`);
  }

  submitSchemaData(schemaId: string, data: any): Observable<any> {
    return this.apiService.post<any>(`${this.getBaseUrl(schemaId)}/`, data);
  }

  updateSchemaData(schemaId: string, dataId: string, data: any): Observable<any> {
    return this.apiService.put<any>(`${this.getBaseUrl(schemaId)}/${dataId}/`, data);
  }

  deleteSchemaData(schemaId: string, dataId: string): Observable<any> {
    return this.apiService.delete<any>(`${this.getBaseUrl(schemaId)}/${dataId}/`);
  }

  private getBaseUrl(schemaId: string): string {
    return `${this.apiUrl}/${schemaId}/${this.path}`;
  }
}
