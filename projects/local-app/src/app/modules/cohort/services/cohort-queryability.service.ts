import {inject, Injectable} from '@angular/core';
import {Observable, of} from 'rxjs';
import {SelectOption} from '@shared-lib/models';
import {ApiService} from '@shared-lib/services/api.service';
import {environment} from '@local-app/env/environment';
import {QueryabilityOption} from '@local-app/cohort/enums';
import {CohortQueryabilityDTO} from '@local-app/cohort/models';

@Injectable({
  providedIn: 'root'
})
export class CohortQueryabilityService {
  private readonly apiUrl = environment.localLearningAPIURL;
  private readonly path = 'cohort'
  private readonly suffix = 'queryability'
  private readonly apiService: ApiService = inject(ApiService);

  getCohortQueryability(cohortId: number | null): Observable<CohortQueryabilityDTO[]> {
    if (!cohortId) return of([]);

    return this.apiService.get<CohortQueryabilityDTO[]>(`${this.getBaseUrl(cohortId)}`);
  }

  createCohortQueryability(cohortId: number, cohortQueryability: CohortQueryabilityDTO[]): Observable<CohortQueryabilityDTO[]> {
    if (!cohortQueryability || cohortQueryability.length === 0) return of([]);
    const dtos = cohortQueryability.map((dto: CohortQueryabilityDTO) => ({
      ...dto,
      queryAbilityInfo: dto.queryAbilityInfo.toUpperCase() as QueryabilityOption,
    }));
    return this.apiService.post<CohortQueryabilityDTO[]>(`${this.getBaseUrl(cohortId)}/bulk`, dtos);
  }

  updateCohortQueryability(cohortId: number, data: CohortQueryabilityDTO[]): Observable<CohortQueryabilityDTO[]> {
    if (!data || data.length === 0) return of([]);
    const dtos = data.map((dto: CohortQueryabilityDTO) => ({
      ...dto,
      queryAbilityInfo: dto.queryAbilityInfo.toUpperCase() as QueryabilityOption,
    }));
    return this.apiService.put<CohortQueryabilityDTO[]>(`${this.getBaseUrl(cohortId)}/bulk`, dtos);
  }

  getCohortQueryabilityOptions(): Observable<SelectOption<QueryabilityOption>[]> {
    return of(Object.values(QueryabilityOption)
      .map(value => ({label: value, value})) as []);
  }

  private getBaseUrl(cohortId: number): string {
    return `${this.apiUrl}/${this.path}/${cohortId}/${this.suffix}`;
  }
}
