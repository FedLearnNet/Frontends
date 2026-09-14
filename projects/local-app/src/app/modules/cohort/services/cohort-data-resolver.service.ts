import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, ResolveFn } from '@angular/router';
import { CohortDataService } from '@local-app/cohort/services/cohort-data.service';
import { LocalStorageService } from '@shared-lib/services/local-storage.service';
import { PaginatedResponse } from '@shared-lib/models';

export const cohortDataListResolver: ResolveFn<PaginatedResponse<any>> = (route: ActivatedRouteSnapshot) => {
    const pageSize = inject(LocalStorageService).getItem('cohort-patients-page-size') || 50;
    return inject(CohortDataService).getAllCohortData(Number(route.paramMap.get('cohortId')), 1, pageSize);
}
