import { Component, Inject, OnInit } from '@angular/core';
import { SchemaFieldStructure, SelectOption } from '@shared-lib/models';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatTreeNestedDataSource } from '@angular/material/tree';
import { NestedTreeControl } from '@angular/cdk/tree';
import { CohortQueryability } from '@local-app/cohort/models';
import { isEmpty } from 'lodash';
import { AbstractControl, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { CohortQueryabilityService } from '@local-app/cohort/services/cohort-queryability.service';
import { QueryabilityOption } from '@local-app/cohort/enums';

interface QueryabilityNode {
    name: string;
    children?: QueryabilityNode[];
}

const BLACK_LISTED_ELEMENTS = ['Unique Patient ID'];

@Component({
    selector: 'app-patient-detail-queryability-form',
    templateUrl: './patient-detail-queryability-form.component.html',
    styleUrl: './patient-detail-queryability-form.component.scss'
})
export class PatientDetailQueryabilityFormComponent implements OnInit {
    cohortQueryability: CohortQueryability[];
    queryabilityOptions: SelectOption[];
    queryabilityFormGroup = this.formBuilder.group({});

    treeControl = new NestedTreeControl<QueryabilityNode>(node => node.children);
    dataSource = new MatTreeNestedDataSource<QueryabilityNode>();

    hasChild = (_: number, node: QueryabilityNode) => !!node.children && node.children.length > 0;

    constructor(
        public dialogRef: MatDialogRef<PatientDetailQueryabilityFormComponent>,

        @Inject(MAT_DIALOG_DATA) public data: any,

        private formBuilder: FormBuilder,
        private schemaDataQueryabilityService: CohortQueryabilityService,
    ) { }

    ngOnInit(): void {
        this.dataSource.data = this.setSchemaStructure(this.data.schemaDynamicFormConfig);

        this.schemaDataQueryabilityService.getCohortQueryability(this.data.schemaUniqueId)
            .subscribe(schemaDataQueryability => {
                    this.loadSchemaDataQueryability(schemaDataQueryability);
                }, error => {
                    if (error.status === 404) {
                        console.log("### 404", error.error.error)
                        this.loadSchemaDataQueryability();
                    }
                }
            );
        this.loadQueryabilityOptions();
    }

    loadQueryabilityOptions(): void {
        this.schemaDataQueryabilityService.getCohortQueryabilityOptions()
            .subscribe(queryabilityOptions => this.queryabilityOptions = queryabilityOptions);
    }

    onCancel(): void {
        this.dialogRef.close();
    }

    onSubmit(): void {
        const updatedFormValues = this.getDirtyFormValues(this.queryabilityFormGroup);

        const schemaDataQueriabilities: CohortQueryability[] = [];
        for (const [key, value] of Object.entries(updatedFormValues)) {
            schemaDataQueriabilities.push({
                id: this.cohortQueryability?.find(queryability => queryability.schemaNodeId === key)?.id ?? null,
                schemaNodeId: key,
                queryabilityInfo: value,
            } as CohortQueryability);
        }

        this.dialogRef.close(schemaDataQueriabilities);
    }

    private setSchemaStructure(formConfig: SchemaFieldStructure[] | undefined): QueryabilityNode[] {
        if (!formConfig || isEmpty(formConfig)) {
            return [];
        }

        const tempData: any[] = [];
        formConfig.forEach(formElement => {
            if (BLACK_LISTED_ELEMENTS.includes(formElement.name)) {
                return;
            }

            if (formElement.nodeType === 'attribute') {
                tempData.push({
                    id: formElement.schemaNodeId,
                    name: formElement.name,
                });

                this.queryabilityFormGroup.addControl(
                    formElement.schemaNodeId,
                    new FormControl(
                        {
                            value: QueryabilityOption.EXISTENCE,
                            disabled: formElement.readonly ?? false,
                        },
                    ),
                );

                return;
            }

            tempData.push({
                name: formElement.name,
                children: this.setSchemaStructure(formElement.fields),
            })
        });

        return tempData;
    }

    private loadSchemaDataQueryability(schemaDataQueryability: CohortQueryability[] = []): void {
        if (isEmpty(schemaDataQueryability)) {
            return;
        }

        this.cohortQueryability = schemaDataQueryability;

        schemaDataQueryability.forEach(queryability => {
            this.queryabilityFormGroup.patchValue({
                [queryability.schemaNodeId as string]: queryability.queryabilityInfo,
            });
        })

    }

    private getDirtyFormValues(formGroup: FormGroup): any {
        const dirtyValues: any = {};

        Object.keys(formGroup.controls).forEach(key => {
            const currentControl: AbstractControl | null = formGroup.get(key);

            if (currentControl?.dirty) {
                if (currentControl instanceof FormGroup) {
                    dirtyValues[key] = this.getDirtyFormValues(currentControl as FormGroup);
                } else {
                    dirtyValues[key] = currentControl.value;
                }
            }
        });

        return dirtyValues;
    }
}
