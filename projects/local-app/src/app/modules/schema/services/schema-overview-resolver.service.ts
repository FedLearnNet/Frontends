import {inject} from '@angular/core';
import {ActivatedRouteSnapshot, ResolveFn} from '@angular/router';
import {SchemaService} from '@local-app/cohort/services/schema.service';
import {SchemaNodeDto, SchemaRootNodeDto} from '@local-app/cohort/dto/schema';

export const globalSchemaListResolver: ResolveFn<SchemaRootNodeDto[]> = () =>
  inject(SchemaService).getGlobalSchemasHead();

export const globalSchemaResolver: ResolveFn<SchemaRootNodeDto> = (route: ActivatedRouteSnapshot) =>
  inject(SchemaService).getGlobalSchemaByRoot(route.paramMap.get('schemaId'));

export const schemaNodeResolver: ResolveFn<SchemaNodeDto> = (route: ActivatedRouteSnapshot) => {
  const nodeId = route.paramMap.get('nodeId');
  return inject(SchemaService).getSchemaDetail(nodeId != null ? Number(nodeId) : null);
};
