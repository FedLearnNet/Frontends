import {Component, inject, input, OnInit} from '@angular/core';
import {MatDialogModule} from '@angular/material/dialog';
import {MatTreeModule, MatTreeNestedDataSource} from '@angular/material/tree';
import {NestedTreeControl} from '@angular/cdk/tree';
import {CohortQueryabilityDTO} from '@local-app/cohort/models';
import {isEmpty} from 'lodash';
import {AbstractControl, FormBuilder, FormControl, FormGroup, ReactiveFormsModule} from '@angular/forms';
import {CohortQueryabilityService} from '@local-app/cohort/services/cohort-queryability.service';
import {QueryabilityOption} from '@local-app/cohort/enums';
import {MatSnackBar} from '@angular/material/snack-bar';
import {TranslatePipe, TranslateService} from '@ngx-translate/core';
import {capitalizeFirstLetter, isNotEmpty} from "@shared-lib/utils";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatInputModule} from "@angular/material/input";
import {MatSelectModule} from "@angular/material/select";
import {MatIconModule} from "@angular/material/icon";
import {MatButtonModule} from "@angular/material/button";
import {isSchemaDataColumnNode, SchemaNodeNestedDto} from "@local-app/cohort/dto/schema";
import {SelectOption} from "@shared-lib/models";
import {HeaderComponent} from "@shared-lib/components/header/header.component";
import {PageWrapperComponent} from "@shared-lib/components/page-wrapper/page-wrapper.component";

interface QueryabilityNode {
  id?: number;
  name: string;
  children?: QueryabilityNode[];
}

const BLACK_LISTED_ELEMENTS = ['Unique Patient ID'];

@Component({
  selector: 'app-patient-detail-queryability-form',
  templateUrl: './patient-detail-queryability-form.component.html',
  styleUrl: './patient-detail-queryability-form.component.scss',
  imports: [
    MatDialogModule,
    MatTreeModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    MatButtonModule,
    TranslatePipe,
    HeaderComponent,
    PageWrapperComponent
  ]
})
export class PatientDetailQueryabilityFormComponent implements OnInit {
  private readonly snackBar: MatSnackBar = inject(MatSnackBar);
  private readonly formBuilder: FormBuilder = inject(FormBuilder);
  private readonly translate: TranslateService = inject(TranslateService);
  private readonly queryabilityService: CohortQueryabilityService = inject(CohortQueryabilityService);


  cohortId = input.required<number>();
  schemaNodes = input.required<SchemaNodeNestedDto[]>()


  cohortQueryability: CohortQueryabilityDTO[] = [];
  queryabilityOptions: SelectOption<QueryabilityOption>[];
  queryabilityFormGroup = this.formBuilder.group({});

  treeControl = new NestedTreeControl<QueryabilityNode>(node => node.children);
  dataSource = new MatTreeNestedDataSource<QueryabilityNode>();

  ngOnInit(): void {
    this.dataSource.data = this.setSchemaStructure(this.schemaNodes());

    this.queryabilityService.getCohortQueryability(this.cohortId())
      .subscribe(schemaDataQueryability => {
          this.loadSchemaDataQueryability(schemaDataQueryability);
        }, error => {
          if (error.status === 404) {
            this.snackBar.open(
              this.translate.instant('ERROR.ERROR_AT', {name: this.translate.instant('ERROR.GET_COHORT_QUERIABILITY')}) + ` ${error}`,
              this.translate.instant('BUTTON.CLOSE'), {
                duration: 5000,
                verticalPosition: 'top',
              });
            this.loadSchemaDataQueryability();
          }
        }
      );
    this.loadQueryabilityOptions();
  }

  hasChild = (_: number, node: QueryabilityNode) => !!node.children && node.children.length > 0;

  loadQueryabilityOptions(): void {
    this.queryabilityService.getCohortQueryabilityOptions()
      .subscribe(queryabilityOptions => this.queryabilityOptions = queryabilityOptions);
  }

  onSubmit(): void {
    const updatedFormValues = this.getDirtyFormValues(this.queryabilityFormGroup);

    const schemaDataQueriabilities: CohortQueryabilityDTO[] = [];
    for (const [key, value] of Object.entries(updatedFormValues)) {

      const schemaNodeId = Number(key);
      const existingQueryability = this.cohortQueryability.find(
        queryability => queryability.schemaNodeId === schemaNodeId
      );
      schemaDataQueriabilities.push({
        ...(existingQueryability ?? {}),
        schemaNodeId,
        queryAbilityInfo: value,
      } as CohortQueryabilityDTO);
    }

    this.submitCohortQueryability(schemaDataQueriabilities);
  }

  private setSchemaStructure(schemaNodes: SchemaNodeNestedDto[] | undefined): QueryabilityNode[] {
    if (!schemaNodes || isEmpty(schemaNodes)) {
      return [];
    }

    const tempData: any[] = [];
    schemaNodes.forEach(node => {
      if (BLACK_LISTED_ELEMENTS.includes(node.name)) {
        return;
      }

      if (isSchemaDataColumnNode(node)) {
        tempData.push({
          id: node.id,
          name: node.name,
        });

        this.queryabilityFormGroup.addControl(
          "" + node.id,
          new FormControl(
            {
              value: QueryabilityOption.VALUE,
              disabled: !!node.dataType.isReadonly,
            },
          ),
        );

        return;
      }

      tempData.push({
        name: node.name,
        children: this.setSchemaStructure(node.childNodes),
      })
    });

    return tempData;
  }

  private loadSchemaDataQueryability(schemaDataQueryability: CohortQueryabilityDTO[] = []): void {
    if (isEmpty(schemaDataQueryability)) {
      return;
    }

    this.cohortQueryability = schemaDataQueryability;
    schemaDataQueryability.forEach(queryability => {
      this.queryabilityFormGroup.patchValue({
        [queryability.schemaNodeId]: capitalizeFirstLetter(queryability.queryAbilityInfo),
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

  private submitCohortQueryability(cohortQueryabilities: CohortQueryabilityDTO[] = []): void {
    const updatableCohortQueryabilities: CohortQueryabilityDTO[] = [];
    const creatableCohortQueryabilities: CohortQueryabilityDTO[] = [];

    cohortQueryabilities.forEach(queryability => {
      if (queryability.id) {
        updatableCohortQueryabilities.push(queryability);
      } else {
        creatableCohortQueryabilities.push(queryability);
      }
    });

    this.updateCohortQueryabilityOption(updatableCohortQueryabilities);
    this.createCohortQueryabilityOption(creatableCohortQueryabilities);
  }

  private updateCohortQueryabilityOption(cohortQueryabilities: CohortQueryabilityDTO[]): void {
    if (isEmpty(cohortQueryabilities)) {
      return;
    }
    if (!cohortQueryabilities.length) {
      return;
    }
    this.queryabilityService
      .updateCohortQueryability(this.cohortId(), cohortQueryabilities)
      .subscribe(result => {
        if (result) {
          this.mergeSavedQueryabilities(result);
          this.snackBar.open(
            this.translate.instant('DIALOG.SUCCESSFULLY_UPDATED'),
            this.translate.instant('BUTTON.CLOSE'), {
              duration: 5000,
              verticalPosition: 'top',
            });
        } else {
          this.snackBar.open(
            this.translate.instant('DIALOG.SOMETHING_WENT_WRONG'),
            this.translate.instant('BUTTON.CLOSE'), {
              duration: 5000,
              verticalPosition: 'top',
            });
        }
      });
  }

  private createCohortQueryabilityOption(cohortQueryabilities: CohortQueryabilityDTO[]): void {
    if (isEmpty(cohortQueryabilities)) {
      return;
    }
    this.queryabilityService
      .createCohortQueryability(this.cohortId(), cohortQueryabilities.map(queryability => {
        return {
          cohortId: this.cohortId(),
          schemaNodeId: queryability.schemaNodeId,
          queryAbilityInfo: queryability.queryAbilityInfo,
        } as CohortQueryabilityDTO;
      }))
      .subscribe(result => {
        if (isNotEmpty(result)) {
          this.mergeSavedQueryabilities(result);
          this.snackBar.open(
            this.translate.instant('DIALOG.SUCCESSFULLY_CREATED'),
            this.translate.instant('BUTTON.CLOSE'), {
              duration: 5000,
              verticalPosition: 'top',
            });
        } else {
          this.snackBar.open(
            this.translate.instant('DIALOG.SOMETHING_WENT_WRONG'),
            this.translate.instant('BUTTON.CLOSE'), {
              duration: 5000,
              verticalPosition: 'top',
            });
        }
      });
  }

  private mergeSavedQueryabilities(saved: CohortQueryabilityDTO[]): void {
    const bySchemaNodeId = new Map(
      this.cohortQueryability.map(queryability => [queryability.schemaNodeId, queryability])
    );
    saved.forEach(queryability => bySchemaNodeId.set(queryability.schemaNodeId, queryability));
    this.cohortQueryability = Array.from(bySchemaNodeId.values());
    this.queryabilityFormGroup.markAsPristine();
  }
}
