import {inject, Injectable} from '@angular/core';
import {ApiService} from '@shared-lib/services/api.service';
import {catchError, Observable, throwError} from 'rxjs';
import {environment} from '@local-app/env/environment';
import { HttpClient, HttpParams } from "@angular/common/http";
import {configToConnectorConfigDTO, ConnectorConfig, ConnectorConfigDTO} from "../models/connector-config";
import {MatSnackBar} from "@angular/material/snack-bar";
import {ApiErrorSnackbarService} from "@shared-lib/services/api-error-snackbar.service";

@Injectable({
  providedIn: 'root'
})
export class ConnectorService {
  private readonly errorSnackbarService: ApiErrorSnackbarService = inject(ApiErrorSnackbarService);
  private readonly apiService: ApiService = inject(ApiService);

  private readonly apiUrl = environment.importerApiUrl;
  private readonly path = 'connector'


  getAll(schemaId?: string): Observable<ConnectorConfigDTO[]> {
    let queryParam;
    if (schemaId) {
      queryParam = new HttpParams().set('schema_id', schemaId);
    }
    return this.apiService.get<ConnectorConfigDTO[]>(`${this.getBaseUrl()}`, queryParam).pipe(
      catchError((err) => this.errorSnackbarService.showSnackBar(err,
        'Failed to fetch connectors'))
    );
  }

  get(id?: number | string | null): Observable<ConnectorConfigDTO> {
    if (!id) {
      return throwError(() => 'No id provided');
    }
    if (typeof id === 'string') {
      id = parseInt(id);
    }
    return this.apiService.get<ConnectorConfigDTO>(`${this.getBaseUrl()}${id}/`).pipe(
      catchError((err) => this.errorSnackbarService.showSnackBar(err,
        'Failed to fetch connector'))
    );
  }

  save(config: ConnectorConfig): Observable<ConnectorConfigDTO> {
    if (config.id) {
      return this._update(config);
    }
    const body: ConnectorConfigDTO = configToConnectorConfigDTO(config);
    return this.apiService.post<ConnectorConfigDTO>(`${this.getBaseUrl()}`, body).pipe(
      catchError((err) => this.errorSnackbarService.showSnackBar(err,
        'Failed to save connector'))
    );
  }

  patch(config: ConnectorConfigDTO): Observable<ConnectorConfigDTO> {
    return this.apiService.patch<ConnectorConfigDTO>(`${this.getBaseUrl()}${config.id}/`, config).pipe(
      catchError((err) => this.errorSnackbarService.showSnackBar(err,
        'Failed to update connector'))
    );
  }


  _update(config: ConnectorConfig): Observable<ConnectorConfigDTO> {
    const body: ConnectorConfigDTO = configToConnectorConfigDTO(config);
    return this.apiService.put<ConnectorConfigDTO>(`${this.getBaseUrl()}${body.id}/`, body).pipe(
      catchError((err) => this.errorSnackbarService.showSnackBar(err,
        'Failed to update connector'))
    );
  }

  private getBaseUrl(): string {
    return `${this.apiUrl}/${this.path}/`;
  }
}
