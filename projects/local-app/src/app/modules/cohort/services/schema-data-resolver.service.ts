import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, ResolveFn } from '@angular/router';
import { SchemaDataService } from '@local-app/cohort/services/schema-data.service';
import { LocalStorageService } from '@shared-lib/services/local-storage.service';
import { SchemaDataResponse } from '@local-app/cohort/models';

export const schemaDataListResolver: ResolveFn<SchemaDataResponse> = (route: ActivatedRouteSnapshot) => {
    const pageSize = inject(LocalStorageService).getItem('cohort-patients-page-size') || 50;
    return inject(SchemaDataService).getAllSchemaData(route.paramMap.get('schemaId'), 1, pageSize);
}
