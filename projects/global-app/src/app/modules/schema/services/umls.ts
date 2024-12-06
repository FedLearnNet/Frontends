import {inject, Injectable} from "@angular/core";
import {ApiService} from "@shared-lib/services/api.service";
import {environment} from "@global-app/env/environment";
import {catchError, Observable, throwError} from "rxjs";
import {OntologyListQueryability} from "@global-app/find-data/models";
import {UMLSDetailResultDTO, UMLSSearchResultDtoPage} from "../dto/umls";
import {HttpParams} from "@angular/common/http";
import cytoscape from 'cytoscape';
import {MatSnackBar} from "@angular/material/snack-bar";
import {filter} from "rxjs/operators";

@Injectable({
  providedIn: 'root'
})
export class UMLSService {
  readonly snackBar = inject(MatSnackBar);
  readonly apiService: ApiService = inject(ApiService);

  private readonly apiUrl = environment.datamodelerApiUrl;
  private readonly path = 'umls';

  search(search: string, page: number, pageSize: number): Observable<UMLSSearchResultDtoPage> {
    const queryParam = new HttpParams()
      .set('search_string', search)
      .set('page', page)
      .set('page_size', pageSize);

    return this.apiService.get<UMLSSearchResultDtoPage>(`${this.getBaseUrl()}/search/`, queryParam).pipe(
      catchError((err) => {
        const errorMessage = JSON.stringify(err.error) || 'Failed to search';
        this.snackBar.open(errorMessage, 'Close', {duration: 5000});
        return throwError(() => err);
      }));
  }

  getUmlsDetails(ui: string): Observable<UMLSDetailResultDTO> {
    return this.apiService.get<UMLSDetailResultDTO>(`${this.getBaseUrl()}/${ui}/`).pipe(
      catchError((err) => {
        const errorMessage = JSON.stringify(err.error) || 'Failed to fetch getUmlsDetails';
        this.snackBar.open(errorMessage, 'Close', {duration: 5000});
        return throwError(() => err);
      }));
  }

  getUmlsParentGraph(ui: string): Observable<cytoscape.ElementDefinition[]> {
    return this.apiService.get<cytoscape.ElementDefinition[]>(`${this.getBaseUrl()}/${ui}/create_cytoscape_graph/`).pipe(
      catchError((err) => {
        const errorMessage = JSON.stringify(err.error) || 'Failed to fetch getUmlsParentGraph';
        this.snackBar.open(errorMessage, 'Close', {duration: 5000});
        return throwError(() => err);
      }));
  }

  createAllParents(ui: string): Observable<Response> {
    return this.apiService.post<Response>(`${this.getBaseUrl()}/create_all_parents_graph/`,
      {id: ui}).pipe(
      catchError((err) => {
        const errorMessage = JSON.stringify(err.error) || 'Failed to create all Parents';
        this.snackBar.open(errorMessage, 'Close', {duration: 5000});
        return throwError(() => err);
      }),
      filter(response => !!response));
  }

  private getBaseUrl(): string {
    return `${this.apiUrl}/${this.path}`;
  }
}
