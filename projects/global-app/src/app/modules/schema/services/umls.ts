import {inject, Injectable} from "@angular/core";
import {ApiService} from "@shared-lib/services/api.service";
import {environment} from "@global-app/env/environment";
import {catchError, Observable, throwError} from "rxjs";
import {UMLSDetailResultDTO, UMLSSearchResultDtoPage} from "../dto/umls";
import {HttpParams} from "@angular/common/http";
import cytoscape from 'cytoscape';
import {MatSnackBar} from "@angular/material/snack-bar";
import {filter} from "rxjs/operators";
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root'
})
export class UMLSService {
  readonly snackBar = inject(MatSnackBar);
  readonly apiService: ApiService = inject(ApiService);
  private readonly translate: TranslateService = inject(TranslateService);

  private readonly apiUrl = environment.datamodelerApiUrl;
  private readonly path = 'umls';

  search(search: string, page: number, pageSize: number): Observable<UMLSSearchResultDtoPage> {
    const queryParam = new HttpParams()
      .set('search_string', search)
      .set('page', page)
      .set('page_size', pageSize);

    return this.apiService.get<UMLSSearchResultDtoPage>(`${this.getBaseUrl()}/search/`, queryParam).pipe(
      catchError((err) => {
        const errorMessage = JSON.stringify(err.error) || this.translate.instant('ERROR.FAILED_TO_SEARCH');
        this.snackBar.open(errorMessage, this.translate.instant('BUTTON.CLOSE'), {duration: 5000});
        return throwError(() => err);
      }));
  }

  getUmlsDetails(ui: string): Observable<UMLSDetailResultDTO> {
    return this.apiService.get<UMLSDetailResultDTO>(`${this.getBaseUrl()}/${ui}/`).pipe(
      catchError((err) => {
        const errorMessage = JSON.stringify(err.error) || this.translate.instant('ERROR.FAILED_TO_FETCH', { name: this.translate.instant('GRID.GET_UMLS_DETAILS').toLowerCase() });
        this.snackBar.open(errorMessage, this.translate.instant('BUTTON.CLOSE'), {duration: 5000});
        return throwError(() => err);
      }));
  }

  getUmlsParentGraph(ui: string): Observable<cytoscape.ElementDefinition[]> {
    return this.apiService.get<cytoscape.ElementDefinition[]>(`${this.getBaseUrl()}/${ui}/cytoscape-graph/`).pipe(
      catchError((err) => {
        const errorMessage = JSON.stringify(err.error) || this.translate.instant('ERROR.FAILED_TO_SAVE', { name: this.translate.instant('GRID.GET_UMLS_PARENT_GRAPH').toLowerCase() });
        this.snackBar.open(errorMessage, this.translate.instant('BUTTON.CLOSE'), {duration: 5000});
        return throwError(() => err);
      }));
  }

  createAllParents(ui: string): Observable<Response> {
    return this.apiService.post<Response>(`${this.getBaseUrl()}/create_all_parents_graph/`,
      {id: ui}).pipe(
      catchError((err) => {
        const errorMessage = JSON.stringify(err.error) || this.translate.instant('ERROR.FAILED_TO_CREATE', { name: this.translate.instant('GRID.ALL_PARENTS').toLowerCase() });
        this.snackBar.open(errorMessage, this.translate.instant('BUTTON.CLOSE'), {duration: 5000});
        return throwError(() => err);
      }),
      filter(response => !!response));
  }

  private getBaseUrl(): string {
    return `${this.apiUrl}/${this.path}`;
  }
}
