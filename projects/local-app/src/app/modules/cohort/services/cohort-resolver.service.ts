import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, ResolveFn } from '@angular/router';
import { Cohort } from '@local-app/cohort/models';
import { CohortService } from '@local-app/cohort/services/cohort.service';
import { CohortListItem } from '@local-app/utils/models/cohort-list-item';

export const cohortListResolver: ResolveFn<CohortListItem[]> = () => {
    return inject(CohortService).getCohorts();
}

export const cohortResolver: ResolveFn<Cohort> = (route: ActivatedRouteSnapshot) => {
    return inject(CohortService).getCohortById(Number(route.paramMap.get('cohort-id')));
}
