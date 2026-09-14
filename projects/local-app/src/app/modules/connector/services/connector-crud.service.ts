import {inject, Injectable} from '@angular/core';
import {ApiService} from '@shared-lib/services/api.service';
import {catchError, Observable, throwError} from 'rxjs';
import {environment} from '@local-app/env/environment';
import {HttpHeaders, HttpParams} from "@angular/common/http";
import {configToConnectorDTO} from "../models/connector-config";
import {ApiErrorSnackbarService} from "@shared-lib/services/api-error-snackbar.service";
import {TranslateService} from '@ngx-translate/core';
import {ConnectorDTO} from "../dto/connector";

@Injectable({
  providedIn: 'root'
})
export class ConnectorService {
  private translate = inject(TranslateService);

  private readonly errorSnackbarService: ApiErrorSnackbarService = inject(ApiErrorSnackbarService);
  private readonly apiService: ApiService = inject(ApiService);

  private readonly apiUrl = environment.localLearningAPIURL;
  private readonly path = 'connectors'

  getAll(cohortId?: string): Observable<ConnectorDTO[]> {
    let queryParam;
    if (cohortId) {
      queryParam = new HttpParams().set('cohort_id', cohortId);
    }
    return this.apiService.get<ConnectorDTO[]>(`${this.getBaseUrl()}`, queryParam).pipe(
      catchError((err) => this.errorSnackbarService.showSnackBar(err,
        this.translate.instant('ERROR.FAILED_TO_FETCH', {name: this.translate.instant('GRID.CONNECTOR').toLowerCase()})))
    );
  }

  get(id?: number | string | null): Observable<ConnectorDTO> {
    if (!id) {
      return throwError(() => this.translate.instant('ERROR.NO_ID_PROVIDED'));
    }
    if (typeof id === 'string') {
      id = parseInt(id);
    }
    return this.apiService.get<ConnectorDTO>(`${this.getBaseUrl()}${id}`).pipe(
      catchError((err) => this.errorSnackbarService.showSnackBar(err,
        this.translate.instant('ERROR.FAILED_TO_FETCH', {name: this.translate.instant('GRID.CONNECTOR').toLowerCase()})))
    );
  }

  save(config: ConnectorDTO): Observable<ConnectorDTO> {
    if (config.id) {
      return this._update(config);
    }
    const body = configToConnectorDTO(config);
    return this.apiService.post<ConnectorDTO>(`${this.getBaseUrl()}`, body).pipe(
      catchError((err) => this.errorSnackbarService.showSnackBar(err,
        this.translate.instant('ERROR.FAILED_TO_SAVE', {name: this.translate.instant('GRID.CONNECTOR').toLowerCase()})))
    );
  }

  saveRaw(config: ConnectorDTO): Observable<ConnectorDTO> {
    const httpParams = new HttpParams().set('raw', 'true');
    const headers = new HttpHeaders();

    return this.apiService.post<ConnectorDTO>(`${this.getBaseUrl()}`, config, headers, httpParams);
  }

  saveViaURL(remoteUrl: string, cohortId?: string): Observable<ConnectorDTO> {
    let httpParams = new HttpParams().set('remote_url', remoteUrl);
    if (cohortId) {
      httpParams = httpParams.set('cohort_id', cohortId);
    }
    const headers = new HttpHeaders();

    return this.apiService.post<ConnectorDTO>(`${this.getBaseUrl()}import-from-remote-url`, null, headers, httpParams).pipe(
      catchError((err) => this.errorSnackbarService.showSnackBar(err,
        this.translate.instant('ERROR.FAILED_TO_IMPORT', {name: this.translate.instant('GRID.CONNECTOR').toLowerCase()})))
    );
  }

  update(config: ConnectorDTO): Observable<ConnectorDTO> {
    return this.apiService.put<ConnectorDTO>(`${this.getBaseUrl()}${config.id}`, config).pipe(
      catchError((err) => this.errorSnackbarService.showSnackBar(err,
        this.translate.instant('ERROR.FAILED_TO_UPDATE', {name: this.translate.instant('GRID.CONNECTOR').toLowerCase()})))
    );
  }

  patch(config: ConnectorDTO): Observable<ConnectorDTO> {
    return this.apiService.patch<ConnectorDTO>(`${this.getBaseUrl()}${config.id}`, config).pipe(
      catchError((err) => this.errorSnackbarService.showSnackBar(err,
        this.translate.instant('ERROR.FAILED_TO_UPDATE', {name: this.translate.instant('GRID.CONNECTOR').toLowerCase()})))
    );
  }


  rollbackConnectorRun(id: number | string, runId: number | string, deleteAudit = false): Observable<any> {
    const httpParams = new HttpParams().set('delete_audit', deleteAudit);
    const headers = new HttpHeaders();

    return this.apiService.put<any>(`${this.getBaseUrl()}${id}/run/${runId}/rollback`, null, headers, httpParams).pipe(
      catchError((err) => this.errorSnackbarService.showSnackBar(err,
        this.translate.instant('ERROR.FAILED_TO_ROLLBACK', {name: this.translate.instant('GRID.CONNECTOR').toLowerCase()})))
    );
  }


  _update(config: ConnectorDTO): Observable<ConnectorDTO> {
    const body = configToConnectorDTO(config);
    return this.apiService.put<ConnectorDTO>(`${this.getBaseUrl()}${body.id}`, body).pipe(
      catchError((err) => this.errorSnackbarService.showSnackBar(err,
        this.translate.instant('ERROR.FAILED_TO_UPDATE', {name: this.translate.instant('GRID.CONNECTOR').toLowerCase()})))
    );
  }

  delete(id: number | string): Observable<any> {
    return this.apiService.delete<any>(`${this.getBaseUrl()}${id}`).pipe(
      catchError((err) => this.errorSnackbarService.showSnackBar(err,
        this.translate.instant('ERROR.FAILED_TO_DELETE', {name: this.translate.instant('GRID.CONNECTOR').toLowerCase()})))
    );
  }

  private getBaseUrl(): string {
    return `${this.apiUrl}/${this.path}/`;
  }
}
