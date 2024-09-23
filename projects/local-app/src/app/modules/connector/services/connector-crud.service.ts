import {Injectable} from '@angular/core';
import {ApiService} from '@shared-lib/services/api.service';
import {catchError, Observable, throwError} from 'rxjs';
import {environment} from '@local-app/env/environment';
import { HttpClient, HttpParams } from "@angular/common/http";
import {configToConnectorConfigDTO, ConnectorConfig, ConnectorConfigDTO} from "../models/connector-config";
import {MatSnackBar} from "@angular/material/snack-bar";

@Injectable({
  providedIn: 'root'
})
export class ConnectorService {
  private readonly apiUrl;
  private readonly path = 'connector'

  constructor(
    private apiService: ApiService,
    private http: HttpClient,
    private snackBar: MatSnackBar
  ) {
    this.apiUrl = environment.importerApiUrl;
  }

  getAll(schemaId?: string): Observable<ConnectorConfigDTO[]> {
    let queryParam;
    if (schemaId) {
      queryParam = new HttpParams().set('schema_id', schemaId);
    }
    return this.apiService.get<ConnectorConfigDTO[]>(`${this.getBaseUrl()}`, queryParam).pipe(
      catchError((err) => {
        const errorMessage = JSON.stringify(err.error) || 'Failed to fetch connectors';
        this.snackBar.open(errorMessage, 'Close', {duration: 5000});
        return throwError(() => err);
      })
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
      catchError((err) => {
        const errorMessage = JSON.stringify(err.error) || 'Failed to fetch connector';
        this.snackBar.open(errorMessage, 'Close', {duration: 5000});
        return throwError(() => err);
      })
    );
  }

  save(config: ConnectorConfig): Observable<ConnectorConfigDTO> {
    if (config.id) {
      return this._update(config);
    }
    const body: ConnectorConfigDTO = configToConnectorConfigDTO(config);
    return this.apiService.post<ConnectorConfigDTO>(`${this.getBaseUrl()}`, body).pipe(
      catchError((err) => {
        const errorMessage = JSON.stringify(err.error) || 'Failed to save connector';
        this.snackBar.open(errorMessage, 'Close', {duration: 5000});
        return throwError(() => err);
      })
    );
  }

  patch(config: ConnectorConfigDTO): Observable<ConnectorConfigDTO> {
    return this.apiService.patch<ConnectorConfigDTO>(`${this.getBaseUrl()}${config.id}/`, config).pipe(
      catchError((err) => {
        const errorMessage = JSON.stringify(err.error) || 'Failed to update connector';
        this.snackBar.open(errorMessage, 'Close', {duration: 5000});
        return throwError(() => err);
      })
    );
  }


  _update(config: ConnectorConfig): Observable<ConnectorConfigDTO> {
    const body: ConnectorConfigDTO = configToConnectorConfigDTO(config);
    return this.apiService.put<ConnectorConfigDTO>(`${this.getBaseUrl()}${body.id}/`, body).pipe(
      catchError((err) => {
        const errorMessage = JSON.stringify(err.error) || 'Failed to update connector';
        this.snackBar.open(errorMessage, 'Close', {duration: 5000});
        return throwError(() => err);
      })
    );
  }

  private getBaseUrl(): string {
    return `${this.apiUrl}/${this.path}/`;
  }
}
