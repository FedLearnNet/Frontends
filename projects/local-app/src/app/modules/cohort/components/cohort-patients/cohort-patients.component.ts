import {Component, ViewChild, OnInit} from '@angular/core';
import {CohortQueryability, SchemaDataResponse} from '@local-app/cohort/models';
import {MatDialog} from '@angular/material/dialog';
import {FormBuilder} from '@angular/forms';
import {ConfirmDialogComponent} from '@shared-lib/components/confirm-dialog/confirm-dialog.component';
import {ResponsiveService} from '@shared-lib/services/responsive.service';
import {XSMALL} from '@shared-lib/constants';
import _, {cloneDeep, isUndefined, groupBy, get} from 'lodash';
import {
  PatientDetailDynamicFormComponent
} from '@local-app/cohort/components/patient-detail-dynamic-form/patient-detail-dynamic-form.component';
import {SchemaService} from '@local-app/cohort/services/schema.service';
import {ActivatedRoute, Router} from '@angular/router';
import {DynamicFormService} from '@local-app/cohort/services/dynamic-form.service';
import {SchemaDataService} from '@local-app/cohort/services/schema-data.service';
import {
  PatientDetailQueryabilityFormComponent
} from '@local-app/cohort/components/patient-detail-queryability-form/patient-detail-queryability-form.component';
import {
  PatientDetailGridSettingsComponent
} from '@local-app/cohort/components/patient-detail-grid-settings/patient-detail-grid-settings.component';
import {concatUnique, isNotEmpty} from '@shared-lib/utils';
import {LocalStorageService} from '@shared-lib/services/local-storage.service';
import {isEmpty} from 'lodash';
import {CohortQueryabilityService} from '@local-app/cohort/services/cohort-queryability.service';
import {Schema, SchemaFieldStructure} from '@shared-lib/models';
import {MatPaginatorComponent} from '@shared-lib/components/mat-paginator/mat-paginator.component';

export class DisplayColumn {
  id: string;
  name: string;
  path: string;
  visible: boolean;
}

@Component({
  selector: 'app-cohort-patients',
  templateUrl: './cohort-patients.component.html',
  styleUrl: './cohort-patients.component.scss',
})
export class CohortPatientsComponent implements OnInit {
  isXSmallScreen: boolean = false;
  storedVisibleColumns: string[] = [];
  visibleColumns: DisplayColumn[] = [];
  requiredColumns: string[] = ['actions'];

  schema: Schema;
  schemaDataList: SchemaDataResponse;
  schemaDynamicFormConfig: SchemaFieldStructure[];
  @ViewChild('paginator') paginator: MatPaginatorComponent;

  constructor(
    public dialog: MatDialog,
    private router: Router,
    private formBuilder: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private schemaService: SchemaService,
    private schemaDataService: SchemaDataService,
    private responsiveService: ResponsiveService,
    private dynamicFormService: DynamicFormService,
    private localStorageService: LocalStorageService,
    private cohortQueryabilityService: CohortQueryabilityService,
  ) {
  }

  get patientTableColumns() {
    return this.visibleColumns.filter(visibleColumn => visibleColumn.visible);
  }

  get displayedColumns() {
    return concatUnique(this.requiredColumns, this.patientTableColumns.map(patientTableColumn => patientTableColumn.path));
  }

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({schema, allData}) => {
      this.schema = schema;
      this.schemaDataList = allData;
      this.schemaDynamicFormConfig = this.dynamicFormService.getDynamicFormConfig(schema?.fields);
    });

    this.initVisibleColumnArray();
    this.checkAndAdjustResponsiveLayout();
  }

  checkAndAdjustResponsiveLayout(): void {
    this.responsiveService
      .getScreenSize()
      .subscribe(screenSize => this.isXSmallScreen = screenSize === XSMALL);
  }

  onClickConnector(): void {
    this.router.navigate(['cohort', this.schema.uniqueId, 'connector']);
  }

  openSchemaDataDynamicFormModal(schemaData = null): void {
    const dialogRef = this.dialog.open(PatientDetailDynamicFormComponent, {
      minWidth: '80%',
      data: {
        schemaData: schemaData,
        schemaUniqueId: this.schema.uniqueId,
        schemaDynamicFormConfig: this.schemaDynamicFormConfig,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (!result) return;

      this.refreshPatientsGrid();
    });
  }

  openCohortQueryabilityModal(): void {
    const dialogRef = this.dialog.open(PatientDetailQueryabilityFormComponent, {
      minWidth: '80%',
      data: {
        schemaUniqueId: this.schema.uniqueId,
        schemaDynamicFormConfig: this.schemaDynamicFormConfig,
      },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (isEmpty(result)) {
        return;
      }

      this.submitCohortQueryability(result);
    });
  }

  openPatientDetailGridSettingsModal(): void {
    const dialogRef = this.dialog.open(PatientDetailGridSettingsComponent, {
      minWidth: '80%',
      data: {
        schemaDynamicFormConfig: this.schemaDynamicFormConfig,
        visibleColumns: this.patientTableColumns.map(visibleColumn => visibleColumn.id),
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (isUndefined(result)) {
        return;
      }

      this.localStorageService.setItem(`${this.schema.uniqueId}-visible-columns`, result);

      this.updatePatientsGridColumns(result);
    });
  }

  getColumnName(column: DisplayColumn): string {
    if (CohortPatientsComponent.hasDuplicateColumnName(this.visibleColumns, column.name)) {
      return column.path.replaceAll('.', ' > ');
    }

    return column.name;
  }

  getRowValue(element: any, column: any): string {
    const value = get(element, column.path);
    if(!value){
      return get(element, _.camelCase(column.path));
    }
    return value;
  }

  editRow(schemaData: any): void {
    this.openSchemaDataDynamicFormModal(schemaData);
  }

  deleteRow(schemaData: any): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Delete patient',
        message: 'Are you sure you want to delete this patient?',
        dismissButtonText: 'Cancel',
        confirmButtonText: 'Delete',
      },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (!result) return;
      this.schemaDataService.deleteSchemaData(this.schema.uniqueId, schemaData.id).subscribe(response => {
        if (response && response.message) {
          if (response.message == 'Data deleted successfully') {
            this.refreshPatientsGrid();
          } else {
            console.log("Error at deleteSchemaData:", response.message)
          }
        } else {
          console.log("Unknown error at deleteSchemaData.")
        }
      }, error => {
        console.log("Error at deleteSchemaData:", error)
      });
    });
  }

  onPageChange(event: any) {
    this.schemaDataService.getAllSchemaData(
      this.schema.uniqueId,
      event.pageIndex + 1,
      event.pageSize)
      .subscribe(schemaData => this.schemaDataList = schemaData);
  }

  private refreshPatientsGrid() {
    this.schemaDataService.getAllSchemaData(
      this.schema.uniqueId,
      this.paginator.pageIndex + 1,
      this.paginator.pageSize)
      .subscribe(schemaData => this.schemaDataList = schemaData);
  }

  private updatePatientsGridColumns(columnNames: string[]): void {
    this.visibleColumns = cloneDeep(this.visibleColumns.map(visibleColumn => ({
      ...visibleColumn,
      visible: columnNames.includes(visibleColumn.id),
    })));
  }

  private initVisibleColumnArray(): void {
    const localStorageKey = `${this.schema?.uniqueId}-visible-columns`;

    if (this.schema && !this.localStorageService.hasKeyValue(localStorageKey)) {
      this.localStorageService.setItem(
        localStorageKey,
        this.schema.fields.filter(field => field.nodeType === 'attribute').map(field => field.schemaNodeId),
      );
    }

    this.storedVisibleColumns = this.localStorageService.getItem(localStorageKey) ?? [];

    this.visibleColumns = this.buildDisplayColumns(this.schemaDynamicFormConfig);
  }

  private buildDisplayColumns(dynamicConfigs: SchemaFieldStructure[], path = '', result: DisplayColumn[] = []) {
    for (const dynamicConfig of dynamicConfigs) {
      const currentPath = path ? `${path}.${dynamicConfig.name}` : dynamicConfig.name;
      result.push(
        {
          id: dynamicConfig.schemaNodeId,
          path: currentPath,
          name: dynamicConfig.name,
          visible: this.storedVisibleColumns.includes(dynamicConfig.schemaNodeId),
        } as DisplayColumn
      );
      if (dynamicConfig.fields && dynamicConfig.fields.length > 0) {
        this.buildDisplayColumns(dynamicConfig.fields, currentPath, result);
      }
    }
    return result;
  }

  private static hasDuplicateColumnName(array: DisplayColumn[], key: string): boolean {
    const grouped = groupBy(array, 'name');

    return grouped[key].length > 1;
  }

  private submitCohortQueryability(cohortQueryabilities: CohortQueryability[] = []): void {
    const updatableCohortQueryabilities: CohortQueryability[] = [];
    const creatableCohortQueryabilities: CohortQueryability[] = [];

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

  private updateCohortQueryabilityOption(cohortQueryabilities: CohortQueryability[]): void {
    if (isEmpty(cohortQueryabilities)) {
      return;
    }

    this.cohortQueryabilityService
      .updateCohortQueryability(this.schema.uniqueId, cohortQueryabilities.filter(queryability => queryability.id))
      .subscribe(result => {
        if (result.success) {
          console.log("Successfully updated!");
        } else {
          console.log('Something went wrong! Try again!');
        }
      });
  }

  private createCohortQueryabilityOption(cohortQueryabilities: CohortQueryability[]): void {
    if (isEmpty(cohortQueryabilities)) {
      return;
    }

    this.cohortQueryabilityService
      .createCohortQueryability(cohortQueryabilities.map(queryability => {
        return {
          cohortId: this.schema.uniqueId,
          schemaNodeId: queryability.schemaNodeId,
          queryabilityInfo: queryability.queryabilityInfo,
        } as CohortQueryability;
      }))
      .subscribe(result => {
        if (isNotEmpty(result)) {
          console.log("Successfully created!");
        } else {
          console.log('Something went wrong! Try again!');
        }
      });
  }
}
