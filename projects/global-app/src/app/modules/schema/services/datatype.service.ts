import {inject, Injectable} from '@angular/core';
import {ApiService} from '@shared-lib/services/api.service';
import {environment} from '@global-app/env/environment';
import {catchError, Observable, of, tap, throwError} from 'rxjs';
import {OntologyListQueryability} from '@global-app/find-data/models';
import {OntologyDTO} from "../dto/ontology";
import {MatSnackBar} from "@angular/material/snack-bar";
import {convertObjectKeysToSnakeCase} from "@shared-lib/utils";
import {HttpParams} from "@angular/common/http";
import {DataTypeDetailDTO, DataTypeDTO, DataTypeSubscriptionDTO} from "../dto/datatype";

@Injectable({
  providedIn: 'root'
})
export class DataTypeService {

  readonly snackBar = inject(MatSnackBar);
  readonly apiService: ApiService = inject(ApiService);
  private readonly apiUrl = environment.datamodelerApiUrl;

  private readonly path = 'datatype';

  getAll(ontologyId?: string): Observable<DataTypeDTO[]> {
    let queryParam = new HttpParams();
    if (ontologyId) {
      queryParam = queryParam.set('ontologyId', ontologyId)
    }
    return this.apiService.get<DataTypeDTO[]>(`${this.getBaseUrl()}`, queryParam).pipe(
      catchError((err) => {
        const errorMessage = JSON.stringify(err.error) || 'Failed to fetch datatypes';
        this.snackBar.open(errorMessage, 'Close', {duration: 5000});
        return throwError(() => err);
      }));
  }

  getAllDetailed(schemaId?: string, dataTypeIds?: string[]): Observable<DataTypeDetailDTO[]> {
    let queryParam = new HttpParams();
    if (schemaId) {
      queryParam = queryParam.set('schemaId', schemaId)
    }
    if (dataTypeIds) {
      queryParam = queryParam.set('dataTypeIds', dataTypeIds.join(','));
    }
    return this.apiService.get<DataTypeDetailDTO[]>(`${this.getBaseUrl()}list_detailed/`, queryParam).pipe(
      catchError((err) => {
        const errorMessage = JSON.stringify(err.error) || 'Failed to fetch datatypes';
        this.snackBar.open(errorMessage, 'Close', {duration: 5000});
        return throwError(() => err);
      }));
  }

  getAllForQuery(ontologyIds?: string[]): Observable<DataTypeSubscriptionDTO[]> {
    let queryParam = new HttpParams();
    if (!ontologyIds) {
      return of([]);
    }
    queryParam = queryParam.set('ontology-ids', ontologyIds.join(','));
    return this.apiService.get<DataTypeSubscriptionDTO[]>(`${this.getBaseUrl()}list_for_query/`, queryParam).pipe(
      catchError((err) => {
        const errorMessage = JSON.stringify(err.error) || 'Failed to fetch datatypes';
        this.snackBar.open(errorMessage, 'Close', {duration: 5000});
        return throwError(() => err);
      }));
  }

  generateDummyData(dataTypesId: string[]): Observable<object[]> {
    let queryParam = new HttpParams().set('dataTypeIds', dataTypesId.join(','));
    queryParam = queryParam.set('amount', '25');
    return this.apiService.get<DataTypeDetailDTO[]>(`${this.getBaseUrl()}gen_dummy_data/`, queryParam).pipe(
      catchError((err) => {
        const errorMessage = JSON.stringify(err.error) || 'Failed to generate dummy data';
        this.snackBar.open(errorMessage, 'Close', {duration: 5000});
        return throwError(() => err);
      }));
  }

  downloadDummyData(dataTypesId: string[]): Observable<HTMLAnchorElement> {
    let queryParam = new HttpParams().set('dataTypeIds', dataTypesId.join(','));
    queryParam = queryParam.set('amount', '25');
    queryParam = queryParam.set('asFile', 'true');

    return this.apiService.download(`${this.getBaseUrl()}gen_dummy_data/`, queryParam).pipe(
      catchError((err) => {
        const errorMessage = JSON.stringify(err.error) || 'Failed to generate dummy data';
        this.snackBar.open(errorMessage, 'Close', {duration: 5000});
        return throwError(() => err);
      }));
  }

  persist(dataType: DataTypeDTO): Observable<DataTypeDTO> {
    return this.apiService.post<DataTypeDTO>(`${this.getBaseUrl()}`, convertObjectKeysToSnakeCase(dataType)).pipe(
      catchError((err) => {
        const errorMessage = JSON.stringify(err.error) || 'Failed to save datatype';
        this.snackBar.open(errorMessage, 'Close', {duration: 5000});
        return throwError(() => err);
      }));
  }

  update(dataType: DataTypeDTO): Observable<DataTypeDTO> {
    return this.apiService.put<DataTypeDTO>(`${this.getBaseUrl()}${dataType.uniqueId}/`,
      convertObjectKeysToSnakeCase(dataType)).pipe(
      catchError((err) => {
        const errorMessage = JSON.stringify(err.error) || 'Failed to update datatype';
        this.snackBar.open(errorMessage, 'Close', {duration: 5000});
        return throwError(() => err);
      }));
  }

  checkValidation(dataType: DataTypeDTO, value: string): Observable<Response> {
    const queryParam = new HttpParams().set('value', value)

    return this.apiService.get<Response>(`${this.getBaseUrl()}${dataType.uniqueId}/check_validations/`, queryParam).pipe(
      catchError((err) => {
        const errorMessage = JSON.stringify(err.error) || 'Validation failed';
        this.snackBar.open(errorMessage, 'Close', {duration: 5000});
        return throwError(() => err);
      }),
      tap(() => {
        const errorMessage = 'Validation successful';
        this.snackBar.open(errorMessage, 'Close', {duration: 5000});
      }));
  }

  private getBaseUrl(): string {
    return `${this.apiUrl}/${this.path}/`;
  }
}
