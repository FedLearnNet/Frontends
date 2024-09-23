import { Injectable } from '@angular/core';
import { environment } from '@global-app/env/environment';
import { forkJoin, map, Observable, switchMap } from 'rxjs';
import { ApiService } from '@shared-lib/services/api.service';
import { Schema, SchemaFieldStructure } from '@shared-lib/models';

@Injectable({
    providedIn: 'root'
})
export class SchemaService {
    private readonly apiUrl;
    private readonly path = 'schema';

    constructor(
        private apiService: ApiService,
    ) {
        this.apiUrl = environment.datamodelerApiUrl;
    }

    getAllSchemasHead(): Observable<Schema[]> {
        return this.apiService.get<Schema[]>(`${ this.getBaseUrl() }/get_head/`);
    }

    getSchemaDynamicConfig(schemaId: string): Observable<Schema> {
        return this.apiService.get<Schema>(`${ this.getBaseUrl() }/${ schemaId }/retrieve_dyn_form/`);
    }

    getAllSchemasConfig(): Observable<SchemaFieldStructure[]> {
        return this.getAllSchemasHead().pipe(
            switchMap(response => {
                const schemaUniqueIds = response.map(schema => schema.uniqueId);

                const schemaObservables = schemaUniqueIds.map(schemaUniqueId =>
                    this.getSchemaDynamicConfig(schemaUniqueId)
                );

                return forkJoin(schemaObservables).pipe(
                    map(schemas => {
                        let dynamicConfigAttributes: SchemaFieldStructure[] = [];
                        schemas.forEach(schema => {
                            dynamicConfigAttributes = dynamicConfigAttributes.concat(this.getDynamicConfigAttributes(schema.fields));
                        });

                        return this.filterUniqueAttributes(dynamicConfigAttributes);
                    })
                );
            })
        );
    }

    private getBaseUrl(): string {
        return `${ this.apiUrl }/${ this.path }`;
    }

    private getDynamicConfigAttributes(dynamicFields: SchemaFieldStructure[]): SchemaFieldStructure[] {
        let dynamicConfigAttributes: SchemaFieldStructure[] = [];

        dynamicFields.forEach(dynamicField => {
           if (dynamicField.nodeType === 'attribute') {
               dynamicConfigAttributes.push(dynamicField);
           }

            dynamicConfigAttributes = dynamicConfigAttributes.concat(this.getDynamicConfigAttributes(dynamicField.fields ?? []));
        });


        return dynamicConfigAttributes;
    }

    private filterUniqueAttributes(schemaFieldStructures: SchemaFieldStructure[]): SchemaFieldStructure[] {
        const uniqueMap = new Map<string, SchemaFieldStructure>();

        schemaFieldStructures.forEach(schemaFieldStructure => {
            uniqueMap.set(schemaFieldStructure.ontologyId, schemaFieldStructure);
        });

        return Array.from(uniqueMap.values());
    }
}
