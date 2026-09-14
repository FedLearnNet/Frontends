import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, ResolveFn } from '@angular/router';
import { CohortDto } from '@local-app/cohort/models';
import { CohortService } from '@local-app/cohort/services/cohort.service';

export const cohortListResolver: ResolveFn<CohortDto[]> = () => {
    return inject(CohortService).getCohorts();
  }

export const cohortResolver: ResolveFn<CohortDto> = (route: ActivatedRouteSnapshot) => {
    return inject(CohortService).getCohortById(route.paramMap.get('cohortId'));
}
