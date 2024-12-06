import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, ResolveFn } from '@angular/router';
import { SchemaService } from '@local-app/cohort/services/schema.service';
import { Schema } from '@shared-lib/models';

export const schemaHeadListResolver: ResolveFn<Schema[]> = () => {
  return inject(SchemaService).getSchemasHead();
}

export const schemaListResolver: ResolveFn<Schema[]> = () => {
  return inject(SchemaService).getSchemas();
}

export const schemaResolver: ResolveFn<Schema> = (route: ActivatedRouteSnapshot) => {
  return inject(SchemaService).getSchema(route.paramMap.get('schemaId'));
}
