import {HttpParams} from '@angular/common/http';
import {inject, Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {PaginatedResponse} from '@shared-lib/models';
import {ApiService} from '@shared-lib/services/api.service';
import {environment} from '@local-app/env/environment';
import {DataTypeTypeEnum} from '@local-app/cohort/dto/data-type';

export interface DataModelOntologyDto {
  id: string;
  name?: string;
  names?: string[];
  description?: string;
  codes?: string[];
  sabs?: string[];
  cui?: string;
}

export interface DataModelDataTypeDto {
  id: string;
  name: string;
  description?: string;
  type: DataTypeTypeEnum;
  options?: string[];
  ontologyIds?: string[];
  schemaIds?: string[];
}

@Injectable({
  providedIn: 'root'
})
export class DataModelForwardService {
  private readonly apiService = inject(ApiService);
  private readonly apiUrl = environment.localLearningAPIURL;
  private readonly path = 'datamodeler';

  searchOntologies(search = '', page = 0, pageSize = 20): Observable<PaginatedResponse<DataModelOntologyDto>> {
    const params = new HttpParams()
      .set('search', search)
      .set('page', page)
      .set('page_size', pageSize);

    return this.apiService.get<PaginatedResponse<DataModelOntologyDto>>(`${this.getBaseUrl()}/ontology`, params);
  }

  getDatatypesForOntology(
    ontologyId: string,
    search = '',
    page = 0,
    pageSize = 100
  ): Observable<PaginatedResponse<DataModelDataTypeDto>> {
    const params = new HttpParams()
      .set('search', search)
      .set('page', page)
      .set('page_size', pageSize);

    return this.apiService.get<PaginatedResponse<DataModelDataTypeDto>>(
      `${this.getBaseUrl()}/ontology/${ontologyId}/datatype`,
      params
    );
  }

  private getBaseUrl(): string {
    return `${this.apiUrl}/${this.path}`;
  }
}
