import { Injectable } from '@angular/core';
import { ApiService } from '@shared-lib/services/api.service';
import { environment } from '@global-app/env/environment';
import { Observable } from 'rxjs';
import { OntologyListQueryability } from '@global-app/find-data/models';

@Injectable({
  providedIn: 'root'
})
export class OntologyService {
  private readonly apiUrl;
  private readonly path = 'ontology';

  constructor(
      private apiService: ApiService,
  ) {
    this.apiUrl = environment.datamodelerApiUrl;
  }

  getOntologyListQueryability(): Observable<OntologyListQueryability[]> {
    return this.apiService.get<OntologyListQueryability[]>(`${ this.getBaseUrl() }/list_queryability/`);
  }

  private getBaseUrl(): string {
    return `${ this.apiUrl }/${ this.path }`;
  }
}
