import {inject, Injectable} from '@angular/core';
import {environment} from '@global-app/env/environment';
import {catchError, Observable, throwError} from 'rxjs';
import {ApiService} from '@shared-lib/services/api.service';
import {HttpParams} from "@angular/common/http";
import {SchemaNodeDetailDTO, SchemaNodeDTO, SchemaNodeType, SchemaStructureDTO} from "@global-app/schema/dto/schema";
import {MatSnackBar} from "@angular/material/snack-bar";
import {TranslateService} from '@ngx-translate/core';

@Injectable({
  providedIn: 'root'
})
export class SchemaService {
  readonly snackBar = inject(MatSnackBar);
  readonly apiService: ApiService = inject(ApiService);
  private readonly apiUrl = environment.datamodelerApiUrl;
  private readonly path = 'schemas';
  private readonly translate: TranslateService = inject(TranslateService);

  getAllSchemasHead(ontologyId?: string): Observable<SchemaNodeDetailDTO[]> {
    let queryParam = new HttpParams();
    if (ontologyId) {
      queryParam = queryParam.set('ontologyId', ontologyId)
    }
    return this.apiService.get<SchemaNodeDetailDTO[]>(`${this.getBaseUrl()}/head`, queryParam);
  }

  createRoot(name: string, description: string): Observable<SchemaNodeDTO> {
    const schema: SchemaNodeDTO = {name: name, description: description, type: SchemaNodeType.ROOT};
    return this.apiService.post<SchemaNodeDTO>(`${this.getBaseUrl()}/head`, schema).pipe(
      catchError((err) => {
        const errorMessage = JSON.stringify(err.error) || this.translate.instant('ERROR.FAILED_TO_SAVE', {name: this.translate.instant('GRID.DATA_TYPE').toLowerCase()});
        this.snackBar.open(errorMessage, this.translate.instant('BUTTON.CLOSE'), {duration: 5000});
        return throwError(() => err);
      }));
  }


  persist(schema: SchemaNodeDTO): Observable<SchemaNodeDTO> {
    return this.apiService.post<SchemaNodeDTO>(`${this.getBaseUrl()}`, schema).pipe(
      catchError((err) => {
        const errorMessage = JSON.stringify(err.error) || this.translate.instant('ERROR.FAILED_TO_SAVE', {name: this.translate.instant('GRID.DATA_TYPE').toLowerCase()});
        this.snackBar.open(errorMessage, this.translate.instant('BUTTON.CLOSE'), {duration: 5000});
        return throwError(() => err);
      }));
  }

  update(schema: SchemaNodeDTO): Observable<SchemaNodeDTO> {
    return this.apiService.put<SchemaNodeDTO>(`${this.getBaseUrl()}/${schema.id}`, schema).pipe(
      catchError((err) => {
        const errorMessage = JSON.stringify(err.error) || this.translate.instant('ERROR.FAILED_TO_UPDATE', {name: this.translate.instant('GRID.DATA_TYPE').toLowerCase()});
        this.snackBar.open(errorMessage, this.translate.instant('BUTTON.CLOSE'), {duration: 5000});
        return throwError(() => err);
      }));
  }

  delete(id: string): Observable<void> {
    return this.apiService.delete<void>(`${this.getBaseUrl()}/${id}`).pipe(
      catchError((err) => {
        const errorMessage = JSON.stringify(err.error) || this.translate.instant('ERROR.FAILED_TO_DELETE', {name: this.translate.instant('GRID.DATA_TYPE').toLowerCase()});
        this.snackBar.open(errorMessage, this.translate.instant('BUTTON.CLOSE'), {duration: 5000});
        return throwError(() => err);
      }));
  }

  getSubStructure(schemaId?: string): Observable<SchemaStructureDTO> {
    return this.apiService.get<SchemaStructureDTO>(`${this.getBaseUrl()}/${schemaId}/sub-structure`);
  }


  private getBaseUrl(): string {
    return `${this.apiUrl}/${this.path}`;
  }
}
