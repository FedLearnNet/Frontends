import { Injectable } from '@angular/core';
import { ApiService } from '@shared-lib/services/api.service';
import { Observable, of } from 'rxjs';
import { environment } from '@local-app/env/environment';
import { Schema } from '@shared-lib/models';
import { HttpClient } from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class SchemaService {
  private readonly apiUrl;
  private readonly path = 'schema'

  constructor(
      private apiService: ApiService,
      private http: HttpClient,
  ) {
    this.apiUrl = environment.harmonizedApiUrl;
  }

  getSchemas(): Observable<Schema[]> {
    return this.apiService.get<Schema[]>(`${this.getBaseUrl()}/`);
  }

  getSchemasHead(): Observable<Schema[]> {
    return this.apiService.get<Schema[]>(`${this.getBaseUrl()}/head/`);
  }

  getSchema(schemaId: string | null): Observable<Schema> {
    if (!schemaId) return of();
    return this.apiService.get<Schema>(`${this.getBaseUrl()}/${schemaId}/`);
  }

  updateSchema(schemaId: string, data: { name: string, description: string }): Observable<Schema> {
    return this.apiService.put<Schema>(`${this.getBaseUrl()}/${schemaId}/label/`, data);
  }

  subscribeToSchema(data: { id?: string|null, path?: string|null}): Observable<Schema> {
    return this.apiService.post<Schema>(`${this.getBaseUrl()}/subscribe/`, data);
  }

  deleteSchema(schemaId: string): Observable<Schema> {
    return this.apiService.delete<Schema>(`${this.getBaseUrl()}/${schemaId}/unsubscribe/`);
  }

  private getBaseUrl(): string {
    return `${this.apiUrl}/${this.path}`;
  }
}
