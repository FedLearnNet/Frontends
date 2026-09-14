import {Component, computed, effect, inject, input, model, signal, untracked} from '@angular/core';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import {CohortDetailDto, isCohortDeleting} from '@local-app/cohort/models';
import {MatDialog} from '@angular/material/dialog';
import {ResponsiveService} from '@shared-lib/services/responsive.service';
import {XSMALL} from '@shared-lib/constants';
import {groupBy} from 'lodash';
import {CohortDataService} from '@local-app/cohort/services/cohort-data.service';
import {
  PatientDetailGridSettingsComponent
} from '@local-app/cohort/components/patient-detail-grid-settings/patient-detail-grid-settings.component';
import {concatUnique} from '@shared-lib/utils';
import {LocalStorageService} from '@shared-lib/services/local-storage.service';
import {ConfirmDialogWithSettingsResult, PaginatedResponse} from '@shared-lib/models';
import {MatPaginatorComponent} from '@shared-lib/components/mat-paginator/mat-paginator.component';
import {
  ConfirmDialogWithSettingsComponent
} from '@shared-lib/components/confirm-dialog-with-settings/confirm-dialog-with-settings.component';
import {TranslatePipe, TranslateService} from '@ngx-translate/core';
import {MatSnackBar} from '@angular/material/snack-bar';
import {PatientDto} from "../../../patient/dto/patient";
import {MatButtonModule} from "@angular/material/button";
import {MatTableModule} from "@angular/material/table";
import {MatIcon} from "@angular/material/icon";
import {MatTooltipModule} from "@angular/material/tooltip";
import {toSignal} from "@angular/core/rxjs-interop";
import {map} from "rxjs";
import {isSchemaDataColumnNode, SchemaNodeNestedDto} from "@local-app/cohort/dto/schema";
import {HeaderComponent} from "@shared-lib/components/header/header.component";
import {PageWrapperComponent} from "@shared-lib/components/page-wrapper/page-wrapper.component";
import {BtnComponent} from "@shared-lib/components/btn/btn.component";

export class DisplayColumn {
  id: number;
  name: string;
  path: string;
  visible: boolean;
}

@Component({
  selector: 'app-cohort-patients',
  templateUrl: './cohort-patients.component.html',
  styleUrl: './cohort-patients.component.scss',
  imports: [
    MatButtonModule,
    MatTableModule,
    TranslatePipe,
    MatIcon,
    MatTooltipModule,
    RouterLink,
    MatPaginatorComponent,
    HeaderComponent,
    PageWrapperComponent,
    BtnComponent
  ]
})
export class CohortPatientsComponent {
  private readonly dialog = inject(MatDialog);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly snackBar: MatSnackBar = inject(MatSnackBar);
  private readonly translate: TranslateService = inject(TranslateService);
  private readonly cohortDataService: CohortDataService = inject(CohortDataService);
  private readonly responsiveService: ResponsiveService = inject(ResponsiveService);
  private readonly localStorageService: LocalStorageService = inject(LocalStorageService);

  cohort = input.required<CohortDetailDto>();
  schemaNodes = input.required<SchemaNodeNestedDto[]>();
  patients = model.required<PaginatedResponse<any>>();

  pageIndex = signal(0);
  pageSize = signal(50);

  readonly isLoading = signal(false);
  readonly actionsDisabled = computed(() => isCohortDeleting(this.cohort()));
  readonly isXSmallScreen = toSignal(
    this.responsiveService.getScreenSize().pipe(map(s => s === XSMALL)),
    {initialValue: false}
  );
  private readonly requiredColumns = ['actions', 'externalPatientId'];
  private readonly storedVisibleColumns = signal<number[]>([]);
  readonly visibleColumns = signal<DisplayColumn[]>([]);
  private readonly lastCohortId = signal<number | undefined>(undefined);

  private readonly _visibleColumnsEffect = effect(() => {
    const cohortId = this.cohort().id;
    this.schemaNodes();

    const previousCohortId = this.lastCohortId();
    if (previousCohortId !== undefined && previousCohortId !== cohortId) {
      untracked(() => this.pageIndex.set(0));
    }
    this.lastCohortId.set(cohortId);

    this.loadVisibleColumns();
  });

  private readonly _pagingEffect = effect(() => {
    const cohortId = this.cohort().id;
    const pageIndex = this.pageIndex();
    const pageSize = this.pageSize();
    this.refreshPatientsGrid(cohortId, pageIndex, pageSize);
  });


  readonly patientTableColumns = computed(() =>
    this.visibleColumns().filter(c => c.visible)
  );

  readonly displayedColumns = computed(() =>
    concatUnique(this.requiredColumns, this.patientTableColumns().map(c => '' + c.id))
  );

  readonly patientsList = computed<any[]>(() =>
    (this.patients()?.results ?? [])
  );

  openAddPatientPage(): void {
    if (this.actionsDisabled()) {
      return;
    }

    void this.router.navigate(['patient', 'new'], {relativeTo: this.route});
  }

  openPatientDetailGridSettingsModal(): void {
    const dialogRef = this.dialog.open(PatientDetailGridSettingsComponent, {
      minWidth: '80%',
      data: {
        schemaDynamicFormConfig: this.schemaNodes(),
        visibleColumns: this.patientTableColumns().map(visibleColumn => visibleColumn.id),
      },
    });

    dialogRef.afterClosed().subscribe((result: number[] | undefined) => {
      if (result === undefined) {
        return;
      }

      this.storedVisibleColumns.set(result);
      this.localStorageService.setItem(`${this.cohort().id}-visible-columns`, result);
      this.updatePatientsGridColumns(result);
    });
  }

  getColumnName(column: DisplayColumn): string {
    if (CohortPatientsComponent.hasDuplicateColumnName(this.visibleColumns(), column.name)) {
      return column.path.replaceAll('.', ' > ');
    }

    return column.name;
  }

  getRowValue(element: any, columnId: number): string {
    return element?.dataEntries.find((entry: any) => entry.schemaNodeId === columnId)?.value ?? '';
  }

  editRow(cohortData: PatientDto): void {
    void this.router.navigate(['patient', cohortData.id], {
      relativeTo: this.route,
      queryParams: {edit: 'true'},
    });
  }

  deleteRow(schemaData: any): void {
    if (this.actionsDisabled()) {
      return;
    }
    this.translate.get([
      'DIALOG.DELETE_PATIENT.TITLE',
      'DIALOG.DELETE_PATIENT.MESSAGE',
      'BUTTON.CANCEL',
      'BUTTON.DELETE',
      'BUTTON.DELETE',
      'DIALOG.DELETE_PATIENT.TRANCE_LOGS_DELETION_WARNING',
    ]).subscribe(translations => {
      const dialogRef = this.dialog.open<ConfirmDialogWithSettingsComponent, any, ConfirmDialogWithSettingsResult>(ConfirmDialogWithSettingsComponent, {
        data: {
          title: translations['DIALOG.DELETE_PATIENT.TITLE'],
          message: translations['DIALOG.DELETE_PATIENT.MESSAGE'],
          dismissButtonText: translations['BUTTON.CANCEL'],
          confirmButtonText: translations['BUTTON.DELETE'],
          // @TODO Currently, we only have soft delete, so hard deletion is not yet supported in the local-learning-api
          // settings: [{
          //   key: 'delete_trace_logs',
          //   label: translations['DIALOG.DELETE_PATIENT.TRANCE_LOGS_DELETION_WARNING'],
          //   value: false,
          // }]
        },
      });

      dialogRef.afterClosed().subscribe(result => {
        if (!result?.confirmed) return;

        this.cohortDataService.deleteCohortData(this.cohort().id, schemaData.id, (result.settings ?? {})['delete_trace_logs']).subscribe({
          next: (_response) => {
            this.refreshPatientsGrid();

            // @TODO If we receive a response, we need to handle it
            // if (response && response.message) {
            //   if (response.message == 'Data deleted successfully') {
            //     this.refreshPatientsGrid();
            //   } else {
            //     this.snackBar.open(
            //       this.translate.instant('ERROR.ERROR_AT', {name: this.translate.instant('ERROR.DELETE_SCHEMA_DATA')}),
            //       this.translate.instant('BUTTON.CLOSE'), {
            //         duration: 5000,
            //         verticalPosition: 'top',
            //       });
            //   }
            // } else {
            //   this.snackBar.open(
            //     this.translate.instant('ERROR.UNKNOWN_ERROR_AT', {name: this.translate.instant('ERROR.DELETE_SCHEMA_DATA')}),
            //     this.translate.instant('BUTTON.CLOSE'), {
            //       duration: 5000,
            //       verticalPosition: 'top',
            //     });
            // }
          },
          error: (error) => {
            this.snackBar.open(
              this.translate.instant('ERROR.ERROR_AT', {name: this.translate.instant('ERROR.DELETE_SCHEMA_DATA')}) + ` ${error}`,
              this.translate.instant('BUTTON.CLOSE'), {
                duration: 5000,
                verticalPosition: 'top',
              });
          }
        });
      });
    })
  }

  private refreshPatientsGrid(cohortId = this.cohort().id, pageIndex = this.pageIndex(), pageSize = this.pageSize()) {
    this.isLoading.set(true);
    this.cohortDataService.getAllCohortData(cohortId, pageIndex + 1, pageSize)
      .subscribe(schemaData => {
        this.isLoading.set(false);
        this.patients.set(schemaData);
      });
  }

  private updatePatientsGridColumns(columnNames: number[]): void {
    this.visibleColumns.set(this.visibleColumns().map(visibleColumn => ({
      ...visibleColumn,
      visible: columnNames.includes(visibleColumn.id),
    })));
  }

  private loadVisibleColumns(): void {
    const localStorageKey = `${this.cohort().id}-visible-columns`;
    this.storedVisibleColumns.set(this.localStorageService.getItem(localStorageKey) ?? []);
    this.visibleColumns.set(this.buildDisplayColumns(this.schemaNodes()));
  }

  private buildDisplayColumns(dynamicConfigs: SchemaNodeNestedDto[], path = '', result: DisplayColumn[] = []) {
    for (const dynamicConfig of dynamicConfigs) {
      const currentPath = path ? `${path}.${dynamicConfig.name}` : dynamicConfig.name;

      if (isSchemaDataColumnNode(dynamicConfig)) {
        result.push(
          {
            id: dynamicConfig.id,
            path: currentPath,
            name: dynamicConfig.name,
            visible: this.storedVisibleColumns().includes(dynamicConfig.id),
          } as DisplayColumn
        );
        continue;
      }

      if (dynamicConfig.childNodes?.length > 0) {
        this.buildDisplayColumns(dynamicConfig.childNodes, currentPath, result);
      }
    }

    return result;
  }

  private static hasDuplicateColumnName(array: DisplayColumn[], key: string): boolean {
    const grouped = groupBy(array, 'name');
    return grouped[key]?.length > 1;
  }


}
