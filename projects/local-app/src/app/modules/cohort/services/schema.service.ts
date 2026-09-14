import {inject, Injectable} from '@angular/core';
import {ApiService} from '@shared-lib/services/api.service';
import {Observable, of} from 'rxjs';
import {environment} from '@local-app/env/environment';
import {
  isSchemaDataColumnNode,
  SchemaNodeDto,
  SchemaNodeNestedDto,
  SchemaRootNodeDto
} from "@local-app/cohort/dto/schema";
import { SortDirection } from '@shared-lib/constants';

@Injectable({
  providedIn: 'root'
})
export class SchemaService {
  private readonly apiService: ApiService = inject(ApiService);
  private readonly apiUrl = environment.localLearningAPIURL;

  private readonly path = 'schema'

  getGlobalSchemasHead(): Observable<SchemaRootNodeDto[]> {
    return this.apiService.get<SchemaRootNodeDto[]>(`${this.getBaseUrl()}`);
  }

  getGlobalSchemaByRoot(schemaId: string | null): Observable<SchemaRootNodeDto> {
    if (!schemaId) return of();
    return this.apiService.get<SchemaRootNodeDto>(`${this.getBaseUrl()}/${schemaId}/retrieve_dyn_form`);
  }

  getSchemaDetail(schemaId: number | null): Observable<SchemaNodeDto> {
    if (!schemaId) return of();
    return this.apiService.get<SchemaNodeDto>(`${this.getBaseUrl()}/${schemaId}`);
  }

  getSchemasForCohort(cohortId: number): Observable<SchemaNodeDto[]> {
    if (!cohortId) return of();
    return this.apiService.get<SchemaNodeDto[]>(`${this.getBaseUrl()}/cohort/${cohortId}`);
  }

  getSchemasForProject(projectId: number): Observable<SchemaNodeDto[]> {
    if (!projectId) return of();
    return this.apiService.get<SchemaNodeDto[]>(`${this.getBaseUrl()}/project/${projectId}`);
  }

  getSchemasNestedForCohort(cohortId: number): Observable<SchemaRootNodeDto> {
    if (!cohortId) return of();
    return this.apiService.get<SchemaRootNodeDto>(`${this.getBaseUrl()}/cohort/${cohortId}/nested`);
  }

  private getBaseUrl(): string {
    return `${this.apiUrl}/${this.path}`;
  }

  flattenRootSchema(root: SchemaRootNodeDto): SchemaNodeDto[] {
    return root.childNodes.flatMap(c => this.flattenSchema(c));
  }

  private flattenSchema(node: SchemaNodeNestedDto): SchemaNodeDto[] {
    if (isSchemaDataColumnNode(node)) {
      return [node];
    }
    return node.childNodes.flatMap(c => this.flattenSchema(c));
  }

  sortSchemaNodes<K extends keyof SchemaNodeDto>(
      nodes: SchemaNodeNestedDto[],
      key: K,
      direction: SortDirection = 'asc'
  ): SchemaNodeNestedDto[] {
    const factor = direction === 'asc' ? 1 : -1;

    return [...nodes]
        .sort((a, b) => {
          const av = a[key];
          const bv = b[key];

          if (typeof av === 'number' && typeof bv === 'number') {
            return (av - bv) * factor;
          }

          if (typeof av === 'string' && typeof bv === 'string') {
            return av.localeCompare(bv) * factor;
          }

          return 0;
        })
        .map(node => ({
          ...node,
          childNodes: node.childNodes?.length
              ? this.sortSchemaNodes(node.childNodes, key, direction)
              : []
        }));
  }

}
