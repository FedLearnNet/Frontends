import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { SchemaService } from '@local-app/cohort/services/schema.service';
import { SchemaRootNodeDto } from "@local-app/cohort/dto/schema";

export const schemaHeadListResolver: ResolveFn<SchemaRootNodeDto[]> = () => {
    return inject(SchemaService).getGlobalSchemasHead();
}
