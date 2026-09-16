import {SelectionModel} from '@angular/cdk/collections';
import {Component, DestroyRef, inject, OnInit} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {MAT_DIALOG_DATA, MatDialog, MatDialogActions, MatDialogContent, MatDialogRef} from '@angular/material/dialog';
import {
  FederatedLearningRequestDto,
  FederatedLearningRequestStatus,
  PatientLearningDto
} from "@local-app/data-review/dto/federated-learning-request";
import {MatButtonModule} from "@angular/material/button";
import {MatDividerModule} from "@angular/material/divider";
import {MatTableDataSource, MatTableModule} from "@angular/material/table";
import {MatCheckboxModule} from "@angular/material/checkbox";
import {CommonModule} from "@angular/common";
import {ProjectDetailDto} from "@global-app/project/dto/project";
import {MatChipListbox, MatChipOption, MatChipSelectionChange} from "@angular/material/chips";
import {MatFormField, MatLabel} from "@angular/material/form-field";
import {MatInput} from "@angular/material/input";
import {MatCardModule} from "@angular/material/card";
import {LogService} from "../../../logs/services/log-service";
import {AppDetailDto} from "@shared-lib/modules/store/dto/app-detail";
import {TranslatePipe} from "@ngx-translate/core";
import {CohortDto} from "@local-app/cohort/models";
import {
  CloseableDialogTitleComponent
} from "@shared-lib/components/closeable-dialog-title/closeable-dialog-title.component";
import {SchemaService} from "@local-app/cohort/services/schema.service";
import {StatusBadgeComponent} from "@shared-lib/components/status-badge/status-badge.component";
import {InfoGridComponent} from "@shared-lib/components/info-grid/info-grid.component";
import {InfoItemComponent} from "@shared-lib/components/info-item/info-item.component";
import {TimeBadgeComponent} from "@shared-lib/components/time-badge/time-badge.component";
import {MatTabChangeEvent, MatTabsModule} from "@angular/material/tabs";
import {Store} from "@ngrx/store";
import {loadWorkflow} from "@shared-lib/modules/workflow/store/workflow.actions";
import {
  WorkflowReadonlyViewComponent
} from "@shared-lib/modules/workflow/components/workflow-readonly-view/workflow-readonly-view.component";
import {selectSelectedWorkflow, selectWorkflowLoading} from "@shared-lib/modules/workflow/store/workflow.selectors";
import {SkeletonLoaderComponent} from "@shared-lib/components/skeleton-loader/skeleton-loader.component";
import {WorkflowNodeDetailDTO} from "@shared-lib/modules/workflow/dto/workflow.dto";
import {
  WorkflowNodeReviewDialogComponent
} from "@shared-lib/modules/workflow/components/workflow-node-review-dialog/workflow-node-review-dialog.component";
import {TrainingReviewActions} from "@local-app/data-review/store/training-review.actions";
import {TrainingUsedDataComponent} from "../../../training/components/training-used-data/training-used-data.component";
import {BadgeComponent} from "@shared-lib/components/badge/badge.component";
import {TrainingService} from "@local-app/data-review/services/training.service";
import {MatProgressBar} from "@angular/material/progress-bar";

interface LearningRequestDataSelectorData {
  request: FederatedLearningRequestDto;
  cohorts: CohortDto[];
}


interface PatientData {
  id: number;
  cohort: string;
  cohortId: number;
  externalPatientId: string;
  requestPatient: PatientLearningDto;
}

interface FilterParams {
  search?: string;
  cohorts: string[];
}

export function getAggregatorLocation(platformIsCoordinator?: boolean): string {
  return platformIsCoordinator
    ? 'The FL-Net Platform connected to this clinic'
    : 'Another participating client (selected randomly)';
}

@Component({
  selector: 'app-learning-request-data-selector-list',
  imports: [
    CommonModule,
    MatDialogContent,
    MatDialogActions,
    MatButtonModule,
    MatDividerModule,
    MatTableModule,
    MatCheckboxModule,
    MatChipListbox,
    MatChipOption,
    MatFormField,
    MatInput,
    MatLabel,
    MatCardModule,
    TranslatePipe,
    CloseableDialogTitleComponent,
    StatusBadgeComponent,
    InfoGridComponent,
    InfoItemComponent,
    TimeBadgeComponent,
    MatTabsModule,
    WorkflowReadonlyViewComponent,
    SkeletonLoaderComponent,
    TrainingUsedDataComponent,
    BadgeComponent,
    MatProgressBar
  ],
  templateUrl: './learning-request-data-selector-list.component.html',
  styleUrl: './learning-request-data-selector-list.component.scss'
})
export class LearningRequestDataSelectorListComponent implements OnInit {
  private readonly dialogRef: MatDialogRef<LearningRequestDataSelectorListComponent> = inject(MatDialogRef);
  private readonly logService: LogService = inject(LogService);
  private readonly dialog: MatDialog = inject(MatDialog);
  private readonly store: Store = inject(Store);
  private readonly schemaService: SchemaService = inject(SchemaService);
  private readonly trainingService: TrainingService = inject(TrainingService);
  private readonly destroyRef: DestroyRef = inject(DestroyRef);

  readonly data = inject<LearningRequestDataSelectorData>(MAT_DIALOG_DATA);
  readonly project: ProjectDetailDto = this.data.request.project;
  readonly aggregatorLocation = getAggregatorLocation(this.project.platformIsCoordinator);

  protected readonly TrainingStatusPending = FederatedLearningRequestStatus.PENDING;

  apps: AppDetailDto[] = [];

  selectedWorkflow = this.store.selectSignal(selectSelectedWorkflow);
  selectedWorkflowLoading = this.store.selectSignal(selectWorkflowLoading);

  displayedColumns: string[] = ['actions', 'name', 'patientId'];
  isLargeScreen: boolean = true;
  screenSize: string;
  patients: PatientData[] = [];
  requestPatients: PatientLearningDto[] = [];
  cohorts: string[] = [];
  selectedPatients: SelectionModel<PatientData> = new SelectionModel<PatientData>(true);
  dataSource = new MatTableDataSource<PatientData>();
  patientsLoading = true;
  patientsLoadError: string | null = null;

  selectedFilter: boolean[] = [];
  searchValue: string;

  ngOnInit(): void {
    this.trainingService.getTraining(this.data.request.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (detail) => {
          this.requestPatients = detail.requestPatients ?? [];
          this.buildPatientTable(this.requestPatients);
          this.patientsLoading = false;
        },
        error: (err: Error) => {
          this.patientsLoadError = err?.message ?? String(err);
          this.patientsLoading = false;
        }
      });
  }

  private buildPatientTable(requestPatients: PatientLearningDto[]): void {
    this.patients = [];
    this.cohorts = [];
    requestPatients.forEach((requestCohort: PatientLearningDto) => {
      const cohortDetail = this.data.cohorts.find((cohort: CohortDto) => cohort.id === requestCohort.internalCohortId);
      if (!cohortDetail) {
        return;
      }
      if (!this.cohorts.includes(cohortDetail.name)) {
        this.cohorts.push(cohortDetail.name);
      }
      this.patients.push({
        id: requestCohort.internalPatientId,
        cohort: cohortDetail.name,
        cohortId: requestCohort.internalCohortId,
        externalPatientId: requestCohort.externalPatientId,
        requestPatient: requestCohort,
      });
    });
    this.dataSource.data = this.patients;
    this.dataSource.filterPredicate = this.createFilter();
    this.onSelectAll();
  }

  onTabChange(evt: MatTabChangeEvent) {
    const label = evt.tab.textLabel?.trim().toLowerCase();
    if (label === 'workflow') {
      this.loadWorkflow();
    }
  }

  loadWorkflow() {
    if (this.project.workflowId && !this.selectedWorkflow()) {
      this.store.dispatch(loadWorkflow({id: this.project.workflowId}))
    }
  }

  isAllSelected(): boolean {
    const numSelected = this.selectedPatients.selected.length;
    const numVisible = this.dataSource.filteredData.length;
    return numSelected === numVisible;
  }

  getSelectedData(): PatientLearningDto[] {
    const selected = new Set(this.selectedPatients.selected.map(patient => patient.requestPatient));

    return this.requestPatients.filter(requestPatient => selected.has(requestPatient));
  }

  onAccept(modelCanBePublic: boolean): void {
    const updatedRequest = this.getSelectedData();
    this.store.dispatch(TrainingReviewActions.updateStatus({
      id: this.data.request.id,
      status: FederatedLearningRequestStatus.APPROVED,
      requestPatients: updatedRequest,
      modelCanBePublic: modelCanBePublic
    }));
    this.dialogRef.close();
  }

  onReject(): void {
    this.selectedPatients.clear();
    this.store.dispatch(TrainingReviewActions.updateStatus({
      id: this.data.request.id,
      status: FederatedLearningRequestStatus.REJECTED
    }));
    this.dialogRef.close();
  }

  onToggleSelection(cohort: PatientData): void {
    this.selectedPatients.toggle(cohort);
  }

  onSelectAll(): void {
    if (this.isAllSelected()) {
      this.selectedPatients.clear();
      return;
    }

    this.dataSource.filteredData.forEach(cohort => this.selectedPatients.select(cohort));
  }

  applySearch(event: Event) {
    this.searchValue = (event.target as HTMLInputElement).value;
    this.filterTable();
  }

  clearFilters() {
    this.selectedFilter = this.cohorts.map(() => false);
    this.filterTable();
  }

  applyFilter(ev: MatChipSelectionChange, index: number) {
    this.selectedFilter[index] = ev.selected;
    this.filterTable();
  }

  filterTable(): void {
    const filter = this.cohorts.filter((_, index) => this.selectedFilter[index]);
    this.dataSource.filter = JSON.stringify({
      search: this.searchValue,
      cohorts: filter
    })
  }

  getSelectedPatientsPerCoHort(id: string): number {
    return this.selectedPatients.selected.filter(patient => patient.cohort === id).length;
  }

  createFilter() {
    return function (data: PatientData, filter: string): boolean {
      const searchTerms: FilterParams = JSON.parse(filter);
      const search = searchTerms.search?.toLowerCase();
      const cohorts = searchTerms.cohorts;
      const matchesSearch = !search
        || (data.externalPatientId ?? '').toLowerCase().includes(search)
        || data.cohort.toLowerCase().includes(search);
      const matchesCohort = cohorts.length === 0 || cohorts.includes(data.cohort);

      return matchesSearch && matchesCohort;
    }
  }

  toggleMaximize(isMaximized: boolean): void {
    if (isMaximized) {
      this.dialogRef.updateSize('100vw', '100vh');
    } else {
      this.dialogRef.updateSize('90vw', '80vh');
    }
  }

  showDetail(node: WorkflowNodeDetailDTO): void {
    this.dialog.open(WorkflowNodeReviewDialogComponent, {
      width: '600px',
      height: '100%',
      position: {top: '0', right: '0'},
      data: node,
    });
  }
}
