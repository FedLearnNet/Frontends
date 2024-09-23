import { Injectable } from '@angular/core';
import { SchemaFieldStructure, SelectOption } from '@shared-lib/models';
import { QueryConfig, QueryOption } from '@global-app/find-data/models';
import { QUERY_OPTIONS_CONFIG } from '@global-app/find-data/configs';
import { DataType } from '@global-app/find-data/enums';
import { isNotEmpty } from '@shared-lib/utils';
import { isEmpty } from 'lodash';
import { OntologyService } from '@global-app/find-data/services/ontology.service';
import { map } from 'rxjs/operators';
import { catchError, Observable, of, switchMap } from 'rxjs';
import { SchemaService } from '@global-app/find-data/services/schema.service';

@Injectable({
    providedIn: 'root'
})
export class QueryBuilderService {
    private queryOptionsMap = new Map<string, QueryOption>();

    constructor(
        private schemaService: SchemaService,
        private ontologyService: OntologyService,
    ) {
        this.initializeQueryOptionsMap();
    }

    getQueryConfigs(): Observable<QueryConfig[]> {
        return this.schemaService.getAllSchemasConfig().pipe(
            switchMap(schemaConfigs =>
                this.prepareQueryConfigs(schemaConfigs).pipe(
                    catchError(error => {
                        console.error('Error loading query configs', error);
                        return of([]);
                    })
                )
            )
        );
    }

    prepareQueryConfigs(schemaConfigs: SchemaFieldStructure[]): Observable<QueryConfig[]> {
        return this.getOrderedSchemaConfigs(schemaConfigs).pipe(
            map(orderedSchemaConfigs => {
                return orderedSchemaConfigs.map(schemaConfig => {
                    const queryOption = this.queryOptionsMap.get(schemaConfig.dataType) as QueryOption;

                    return {
                        name: schemaConfig.name,
                        label: schemaConfig.label,
                        ontologyId: schemaConfig.ontologyId,
                        options: QueryBuilderService.getSchemaConfigOptions(schemaConfig.options, queryOption.type),
                        description: schemaConfig.description,
                        queryOption: queryOption,
                    } as QueryConfig;
                });
            })
        );
    }

    buildQueryString(queryArray: any[]): any {
        if (isEmpty(queryArray)) {
            return '';
        }

        return {
            query: queryArray.map(item => ({
                ontology_id: item.ontologyId,
                operator: [{ operator: item.operator, value: item.value }]
            }))
        };
    }

    getFormattedQueryString(queryString: string, queryConfigs: QueryConfig[]): string {
        let formattedQueryString = '';
        const queries = JSON.parse(queryString);

        queries.forEach((query: any, index: number) => {
            const columnName =  queryConfigs.find(queryConfig => queryConfig.ontologyId === query.ontology_id)?.name ?? '';
            const queryOperator = query.operator[0];

            formattedQueryString +=
                `${columnName} ${queryOperator.operator} ${queryOperator.value} ${queries.length !== index + 1 ? '\nAND\n' : ''}`;
        });

        return formattedQueryString;
    }

    private initializeQueryOptionsMap() {
        QUERY_OPTIONS_CONFIG.forEach(option => {
            this.queryOptionsMap.set(option.type, option);
        });
    }

    private static getSchemaConfigOptions(options: SelectOption[] | undefined, queryOptionType: string): SelectOption[] {
        if (options && isNotEmpty(options)) {
            return options;
        }

        return queryOptionType === DataType.BOOLEAN ? QueryBuilderService.getBooleanOptions() : []
    }

    private static getBooleanOptions(): SelectOption[] {
        return [
            { label: 'True', value: true },
            { label: 'False', value: false },
        ];
    }

    private getOrderedSchemaConfigs(schemaConfigs: SchemaFieldStructure[]): Observable<SchemaFieldStructure[]> {
        return this.ontologyService.getOntologyListQueryability().pipe(
            map(response => {
                const orderMapping: { [key: string]: number } = response.reduce<{ [key: string]: number }>((acc, item) => {
                    acc[item.uniqueId] = item.clients.length;
                    return acc;
                }, {});

                return schemaConfigs.sort((a, b) => {
                    const orderA = orderMapping[a.ontologyId] ?? 0;
                    const orderB = orderMapping[b.ontologyId] ?? 0;
                    return orderB - orderA;
                });
            })
        );
    }
}
