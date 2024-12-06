import {inject, Injectable} from '@angular/core';
import {ApiService} from '@shared-lib/services/api.service';
import {environment} from '@global-app/env/environment';
import {catchError, Observable, throwError} from 'rxjs';
import {OntologyListQueryability} from '@global-app/find-data/models';
import {OntologyDTO} from "../dto/ontology";
import {MatSnackBar} from "@angular/material/snack-bar";
import {convertObjectKeysToSnakeCase} from "@shared-lib/utils";

@Injectable({
  providedIn: 'root'
})
export class OntologyService {

  readonly snackBar = inject(MatSnackBar);
  readonly apiService: ApiService = inject(ApiService);
  private readonly apiUrl = environment.datamodelerApiUrl;

  private readonly path = 'ontology';

  getAll(): Observable<OntologyDTO[]> {
    return this.apiService.get<OntologyDTO[]>(`${this.getBaseUrl()}`).pipe(
      catchError((err) => {
        const errorMessage = JSON.stringify(err.error) || 'Failed to fetch ontologies';
        this.snackBar.open(errorMessage, 'Close', {duration: 5000});
        return throwError(() => err);
      }));
  }


  put(dto: OntologyDTO): Observable<OntologyDTO> {
    return this.apiService.put<OntologyDTO>(`${this.getBaseUrl()}${dto.uniqueId}/`, convertObjectKeysToSnakeCase(dto)).pipe(
      catchError((err) => {
        const errorMessage = JSON.stringify(err.error) || 'Failed to update ontology';
        this.snackBar.open(errorMessage, 'Close', {duration: 5000});
        return throwError(() => err);
      }));
  }

  getOntologyListQueryability(): Observable<OntologyListQueryability[]> {
    return this.apiService.get<OntologyListQueryability[]>(`${this.getBaseUrl()}list_queryability/`);
  }

  private getBaseUrl(): string {
    return `${this.apiUrl}/${this.path}/`;
  }
}
