import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { SelectOption } from '@shared-lib/models';
import { ApiService } from '@shared-lib/services/api.service';
import { environment } from '@local-app/env/environment';
import { QueryabilityOption } from '@local-app/cohort/enums';
import { CohortQueryability } from '@local-app/cohort/models';
import { convertObjectKeysToSnakeCase } from '@shared-lib/utils';

@Injectable({
    providedIn: 'root'
})
export class CohortQueryabilityService {
    private readonly apiUrl;
    private readonly path = 'cohort-queryability'

    constructor(
        private apiService: ApiService,
    ) {
        this.apiUrl = `${ environment.clientMetaApiUrl }/client_meta_api`;
    }

    getCohortQueryability(cohortId: string | null): Observable<[]> {
        if (!cohortId) return of([]);

        return this.apiService.get<[]>(`${ this.getBaseUrl() }/${ cohortId }/`);
    }

    createCohortQueryability(cohortQueryability: CohortQueryability[]): Observable<[]> {
        return this.apiService.post<any>(`${ this.getBaseUrl()}/`, convertObjectKeysToSnakeCase(cohortQueryability));
    }

    updateCohortQueryability(cohortId: string, data: any): Observable<any> {
        return this.apiService.patch<any>(`${ this.getBaseUrl() }/${ cohortId }/`, convertObjectKeysToSnakeCase(data));
    }

    getCohortQueryabilityOptions(): Observable<SelectOption[]> {
        return of(Object.values(QueryabilityOption as any)
            .map(value => ({ label: value, value })) as []);
    }

    private getBaseUrl(): string {
        return `${ this.apiUrl }/${ this.path }`;
    }
}
