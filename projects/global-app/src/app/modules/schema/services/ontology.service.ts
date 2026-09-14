import {inject, Injectable} from '@angular/core';
import {ApiService} from '@shared-lib/services/api.service';
import {environment} from '@global-app/env/environment';
import {catchError, Observable, throwError} from 'rxjs';
import {OntologyListQueryability} from '@global-app/find-data/models';
import {CreateOntologyDTO, OntologyDTO, OntologyNodeDTO, OntologySearchResponseDTO} from "../dto/ontology";
import {MatSnackBar} from "@angular/material/snack-bar";
import {TranslateService} from '@ngx-translate/core';
import {PaginatedResponse} from "@shared-lib/models";
import {HttpHeaders, HttpParams} from "@angular/common/http";
import {SKIP_LOADING} from "@shared-lib/interceptors/loading.interceptor";

@Injectable({
  providedIn: 'root'
})
export class OntologyService {

  readonly snackBar = inject(MatSnackBar);
  readonly apiService: ApiService = inject(ApiService);
  private readonly apiUrl = environment.datamodelerApiUrl;

  private readonly path = 'ontology';
  private readonly translate: TranslateService = inject(TranslateService);

  getById(id: string): Observable<OntologyNodeDTO> {
    return this.apiService.get<OntologyNodeDTO>(`${this.getBaseUrl()}/${id}`).pipe(
      catchError((err) => {
        const errorMessage = JSON.stringify(err.error) || this.translate.instant('ERROR.FAILED_TO_FETCH', {name: this.translate.instant('GRID.ONTOLOGIES').toLowerCase()});
        this.snackBar.open(errorMessage, this.translate.instant('BUTTON.CLOSE'), {duration: 5000});
        return throwError(() => err);
      }));
  }

  getAllRelationshipsById(id: string): Observable<OntologyNodeDTO[]> {
    return this.apiService.get<OntologyNodeDTO[]>(`${this.getBaseUrl()}/${id}/edges`).pipe(
      catchError((err) => {
        const errorMessage = JSON.stringify(err.error) || this.translate.instant('ERROR.FAILED_TO_FETCH', {name: this.translate.instant('GRID.ONTOLOGIES').toLowerCase()});
        this.snackBar.open(errorMessage, this.translate.instant('BUTTON.CLOSE'), {duration: 5000});
        return throwError(() => err);
      }));
  }

  getAllNeighborsById(id: string): Observable<OntologyDTO> {
    return this.apiService.get<OntologyDTO>(`${this.getBaseUrl()}/${id}/neighbors`).pipe(
      catchError((err) => {
        const errorMessage = JSON.stringify(err.error) || this.translate.instant('ERROR.FAILED_TO_FETCH', {name: this.translate.instant('GRID.ONTOLOGIES').toLowerCase()});
        this.snackBar.open(errorMessage, this.translate.instant('BUTTON.CLOSE'), {duration: 5000});
        return throwError(() => err);
      }));
  }

  getAll(): Observable<PaginatedResponse<OntologyNodeDTO>> {
    return this.apiService.get<PaginatedResponse<OntologyNodeDTO>>(`${this.getBaseUrl()}`).pipe(
      catchError((err) => {
        const errorMessage = JSON.stringify(err.error) || this.translate.instant('ERROR.FAILED_TO_FETCH', {name: this.translate.instant('GRID.ONTOLOGIES').toLowerCase()});
        this.snackBar.open(errorMessage, this.translate.instant('BUTTON.CLOSE'), {duration: 5000});
        return throwError(() => err);
      }));
  }

  getAllFiltered(search: string, page: number, pageSize: number): Observable<PaginatedResponse<OntologyNodeDTO>> {
    const headers = new HttpHeaders().set(SKIP_LOADING, 'true');
    let params = new HttpParams()
    if (search) {
      params = params.set('search', search);
    }
    params = params.set('page', page);
    params = params.set('page_size', pageSize);

    return this.apiService.get<PaginatedResponse<OntologyNodeDTO>>(`${this.getBaseUrl()}`, params, headers).pipe(
      catchError((err) => {
        const errorMessage = JSON.stringify(err.error) || this.translate.instant('ERROR.FAILED_TO_FETCH', {name: this.translate.instant('GRID.ONTOLOGIES').toLowerCase()});
        this.snackBar.open(errorMessage, this.translate.instant('BUTTON.CLOSE'), {duration: 5000});
        return throwError(() => err);
      }));
  }

  getAllEmbeddingSearch(search: string, maxResults: number): Observable<OntologySearchResponseDTO[]> {
    const headers = new HttpHeaders().set(SKIP_LOADING, 'true');
    let params = new HttpParams()
    if (search) {
      params = params.set('search', search);
    }
    params = params.set('max_results', maxResults);
    return this.apiService.get<OntologySearchResponseDTO[]>(`${this.getBaseUrl()}/embedding/search`, params, headers).pipe(
      catchError((err) => {
        const errorMessage = JSON.stringify(err.error) || this.translate.instant('ERROR.FAILED_TO_FETCH', {name: this.translate.instant('GRID.ONTOLOGIES').toLowerCase()});
        this.snackBar.open(errorMessage, this.translate.instant('BUTTON.CLOSE'), {duration: 5000});
        return throwError(() => err);
      }));
  }

  put(dto: OntologyNodeDTO): Observable<OntologyNodeDTO> {
    return this.apiService.post<OntologyNodeDTO>(`${this.getBaseUrl()}/${dto.id}/`, dto).pipe(
      catchError((err) => {
        const errorMessage = JSON.stringify(err.error) || this.translate.instant('ERROR.FAILED_TO_UPDATE', {name: this.translate.instant('GRID.ONTOLOGY').toLowerCase()});
        this.snackBar.open(errorMessage, this.translate.instant('BUTTON.CLOSE'), {duration: 5000});
        return throwError(() => err);
      }));
  }

  create(dto: CreateOntologyDTO): Observable<OntologyNodeDTO> {
    return this.apiService.post<OntologyNodeDTO>(`${this.getBaseUrl()}`, dto);
  }

  getOntologyListQueryability(): Observable<OntologyListQueryability[]> {
    return this.apiService.get<OntologyListQueryability[]>(`${this.getBaseUrl()}list_queryability/`);
  }

  private getBaseUrl(): string {
    return `${this.apiUrl}/${this.path}`;
  }
}
