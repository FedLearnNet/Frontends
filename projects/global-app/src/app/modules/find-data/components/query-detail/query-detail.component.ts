import { Component, Inject, QueryList, ViewChildren, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { QueryService } from '@global-app/find-data/services/query.service';
import { FormBuilder, Validators } from '@angular/forms';
import { QueryConfig, QueryResult } from '@global-app/find-data/models';
import { SchemaService } from '@global-app/find-data/services/schema.service';
import { QueryBuilderService } from '@global-app/find-data/services/query-builder.service';
import { QueryBuilderItemComponent } from '@global-app/find-data/components/query-builder-item/query-builder-item.component';
import { switchMap } from 'rxjs';
import { isEmpty } from 'lodash';

@Component({
    selector: 'app-query-detail',
    templateUrl: './query-detail.component.html',
    styleUrl: './query-detail.component.scss',
})
export class QueryDetailComponent implements OnInit {
    isQueryRunning: boolean = false;

    queryResult: QueryResult;
    queryConfigs: QueryConfig[] = [];

    @ViewChildren(QueryBuilderItemComponent) children!: QueryList<QueryBuilderItemComponent>;

    queryList: any[] = [];

    queryDetailForm = this.formBuilder.group({
        name: ['', Validators.required],
    });

    get isQueryExecuted(): boolean {
        return this.queryResult?.result !== undefined;
    }

    get queryResults(): number {
        return this.queryResult.result;
    }

    constructor(
        public dialogRef: MatDialogRef<QueryDetailComponent>,

        @Inject(MAT_DIALOG_DATA) public data: any,

        private queryService: QueryService,
        private schemaService: SchemaService,
        private queryBuilderService: QueryBuilderService,

        private formBuilder: FormBuilder,
    ) { }

    ngOnInit(): void {
        this.queryConfigs = this.data.queryConfigs;

        this.loadQueryData();
    }

    loadQueryData(): void {
        if (!this.data?.queryData) return;

        const queryData = this.data.queryData;

        console.log("### QUERY DATA", queryData)

        this.loadDataToQueryBuilder(queryData.queryString);

    //     this.queryDetailForm.patchValue({...queryData} as Query);
    //
    //     // Add a dummy query item row
    //     this.onAddQueryItem();
    //
    //     if (isNotEmpty(queryData.result)) {
    //       this.isQueryExecuted = true;
    //       this.queryResult = queryData.result;
    //     }
    }

    onAddQueryItem(queryData= {}): void {
        this.queryList.push({
            id: this.queryList.length + 1,
            ...queryData,
        });

        this.handleQueryChange();
    }

    removeQueryItem(itemId: number): void {
        this.queryList = this.queryList.filter(queryItem => queryItem.id !== itemId);

        this.handleQueryChange();
    }

    onRunQuery(): void {
        const queryString = this.queryBuilderService
            .buildQueryString(
                this.children
                    .map(child => child.queryBuilderFormGroup.valid && child.queryBuilderFormGroup.getRawValue())
                    .filter(queryValue => queryValue)
            );

        if (isEmpty(queryString)) {
            return;
        }

        this.executeQuery(queryString);
    }

    onCancel(): void {
        this.dialogRef.close();
    }

    onSubmit(): void {
    //     if (this.isQueryDetailInvalid()) return;
    //
    //     this.dialogRef.close({
    //         ...this.data?.queryData,
    //         ...this.queryDetailForm.getRawValue(),
    //         result: this.isQueryExecuted ? this.queryResult : null,
    //     });
    }

    isQueryDetailInvalid(): boolean {
        this.queryDetailForm.markAllAsTouched();

        return this.queryDetailForm.invalid;
    }

    getSubmitButtonLabel(): string {
        return `${ this.data?.queryData ? 'Update' : 'Create' } query`;
    }

    handleQueryChange(): void {
        if (!this.isQueryExecuted) {
            return;
        }

        this.queryResult = {} as QueryResult;
    }

    private executeQuery(queryString: string): void {
        this.isQueryRunning = true;

        this.queryService.startQuery(queryString).pipe(
            switchMap(response => {
                return this.queryService.pollQueryResult(response.queryId);
            })
        ).subscribe(
            result => {
                this.handleQueryResult(result);
            },
            error => {
                this.isQueryRunning = false;

                console.error('Error:', error);
            }
        );
    }

    private handleQueryResult(queryResult: QueryResult): void {
        this.isQueryRunning = false;
        this.queryResult = queryResult;
    }

    private loadDataToQueryBuilder(queryString: string): void {
        const queries = JSON.parse(queryString);

        queries.forEach((query: any) => {
            this.onAddQueryItem({
                ontologyId: query.ontology_id,
                operator: query.operator[0].operator,
                value: query.operator[0].value,
            });
        });
    }
}
