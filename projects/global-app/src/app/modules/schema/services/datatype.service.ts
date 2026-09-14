import {inject, Injectable} from '@angular/core';
import {ApiService} from '@shared-lib/services/api.service';
import {environment} from '@global-app/env/environment';
import {catchError, map, Observable, of, tap} from 'rxjs';
import {HttpParams} from "@angular/common/http";
import {
  DataTypeDetailDTO,
  DataTypeDetailFlatten,
  DataTypeNodeDTO,
  DataTypeSubscriptionDTO,
  DummyDataRequestDTO
} from "../dto/datatype";
import {TranslateService} from '@ngx-translate/core';
import {PaginatedResponse} from "@shared-lib/models";
import {ApiErrorSnackbarService} from "@shared-lib/services/api-error-snackbar.service";

@Injectable({
  providedIn: 'root'
})
export class DataTypeService {
  private readonly errorSnackbarService: ApiErrorSnackbarService = inject(ApiErrorSnackbarService);
  readonly apiService: ApiService = inject(ApiService);
  private readonly apiUrl = environment.datamodelerApiUrl;
  private readonly translate: TranslateService = inject(TranslateService);

  private readonly path = 'datatype';

  getById(id: string): Observable<DataTypeNodeDTO> {
    return this.apiService.get<DataTypeNodeDTO>(`${this.getBaseUrl()}${id}`).pipe(
      catchError((err) => this.errorSnackbarService.showSnackBar(err,
        this.translate.instant('ERROR.FAILED_TO_FETCH', {name: this.translate.instant('GRID.DATA_TYPE').toLowerCase()}))));
  }

  getAll(page: number, pageSize: number, ontologyId?: string, search?: string): Observable<PaginatedResponse<DataTypeNodeDTO>> {
    let queryParam = new HttpParams();
    if (ontologyId) {
      queryParam = queryParam.set('ontologyId', ontologyId)
    }
    if (search) {
      queryParam = queryParam.set('search', search);
    }
    queryParam = queryParam.set('page', page);
    queryParam = queryParam.set('page_size', pageSize);
    return this.apiService.get<PaginatedResponse<DataTypeNodeDTO>>(`${this.getBaseUrl()}`, queryParam).pipe(
      catchError((err) => this.errorSnackbarService.showSnackBar(err,
        this.translate.instant('ERROR.FAILED_TO_FETCH', {name: this.translate.instant('GRID.DATA_TYPES').toLowerCase()}))));
  }

  getAllDetailed(schemaId?: string, dataTypeIds?: string[]): Observable<PaginatedResponse<DataTypeDetailDTO>> {
    let queryParam = new HttpParams();
    if (schemaId) {
      queryParam = queryParam.set('schemaId', schemaId)
    }
    if (dataTypeIds) {
      queryParam = queryParam.set('dataTypeIds', dataTypeIds.join(','));
    }
    return this.apiService.get<PaginatedResponse<DataTypeDetailDTO>>(`${this.getBaseUrl()}detailed`, queryParam).pipe(
      catchError((err) => this.errorSnackbarService.showSnackBar(err,
        this.translate.instant('ERROR.FAILED_TO_FETCH', {name: this.translate.instant('GRID.DATA_TYPES').toLowerCase()}))));
  }

  getAllDetailedFlatten(schemaId?: string, dataTypeIds?: string[]): Observable<DataTypeDetailFlatten[]> {
    return this.getAllDetailed(schemaId, dataTypeIds).pipe(
      map((r) => r.results),
      map((dataTypes: DataTypeDetailDTO[]) => {
        return dataTypes.flatMap(dataType =>
          dataType.ontologies?.map(ontology => ({
            ...dataType,
            ontologies: undefined,
            ontology,
          })) || [dataType]
        );
      })
    )
  }

  getAllForQuery(ontologyIds?: string[]): Observable<DataTypeSubscriptionDTO[]> {
    let queryParam = new HttpParams();
    if (!ontologyIds) {
      return of([]);
    }
    queryParam = queryParam.set('ontology-ids', ontologyIds.join(','));
    return this.apiService.get<DataTypeSubscriptionDTO[]>(`${this.getBaseUrl()}query`, queryParam).pipe(
      catchError((err) => this.errorSnackbarService.showSnackBar(err,
        this.translate.instant('ERROR.FAILED_TO_FETCH', {name: this.translate.instant('GRID.DATA_TYPES').toLowerCase()})))
    );
  }

  generateDummyData(request: DummyDataRequestDTO): Observable<object[]> {
    return this.apiService.post<DataTypeDetailDTO[]>(`${this.getBaseUrl()}dummy-data`, request).pipe(
      catchError((err) => this.errorSnackbarService.showSnackBar(err,
        this.translate.instant('ERROR.FAILED_TO_GENERATE', {name: this.translate.instant('GRID.DUMMY_DATA').toLowerCase()})))
    );
  }

  downloadDummyData(request: DummyDataRequestDTO): Observable<HTMLAnchorElement> {
    request.asFile = true;

    return this.apiService.downloadPost(`${this.getBaseUrl()}dummy-data`, undefined, undefined, request).pipe(
      catchError((err) => this.errorSnackbarService.showSnackBar(err,
        this.translate.instant('ERROR.FAILED_TO_GENERATE', {name: this.translate.instant('GRID.DUMMY_DATA').toLowerCase()})))
    );
  }

  persist(dataType: DataTypeNodeDTO): Observable<DataTypeNodeDTO> {
    return this.apiService.post<DataTypeNodeDTO>(`${this.getBaseUrl()}`, dataType).pipe(
      catchError((err) => this.errorSnackbarService.showSnackBar(err,
        this.translate.instant('ERROR.FAILED_TO_SAVE', {name: this.translate.instant('GRID.DATA_TYPE').toLowerCase()})))
    );
  }

  update(dataType: DataTypeNodeDTO): Observable<DataTypeNodeDTO> {
    return this.apiService.put<DataTypeNodeDTO>(`${this.getBaseUrl()}${dataType.id}`, dataType).pipe(
      catchError((err) => this.errorSnackbarService.showSnackBar(err,
        this.translate.instant('ERROR.FAILED_TO_UPDATE', {name: this.translate.instant('GRID.DATA_TYPE').toLowerCase()})))
    );
  }

  checkValidation(dataType: DataTypeNodeDTO, value: string): Observable<Response> {
    const queryParam = new HttpParams().set('value', value)

    return this.apiService.get<Response>(`${this.getBaseUrl()}${dataType.id}/check-validations`, queryParam).pipe(
      catchError((err) => this.errorSnackbarService.showSnackBar(err,
        this.translate.instant('VALIDATION.VALIDATION_FAILED', {name: this.translate.instant('BUTTON.CLOSE').toLowerCase()}))),
      tap(() => {
        const errorMessage = this.translate.instant('VALIDATION.VALIDATION_SUCCESSFUL');
        this.errorSnackbarService.showSnackBar(errorMessage, this.translate.instant('BUTTON.CLOSE'));
      })
    );
  }

  private getBaseUrl(): string {
    return `${this.apiUrl}/${this.path}/`;
  }
}
