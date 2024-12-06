import {SelectionModel} from '@angular/cdk/collections';
import {Component, inject, Inject, OnInit} from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogContent,
  MatDialogRef, MatDialogTitle
} from '@angular/material/dialog';
import {Schema} from '@shared-lib/models';
import {
  FederatedLearningRequestDto,
  FederatedLearningRequestPatientsDto
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
import {TrainingService} from "@local-app/data-review/services/training.service";
import {TrainingStatus} from "@local-app/data-review/models";
import {MatCardModule} from "@angular/material/card";
import {LogService} from "../../../logs/services/log-service";
import {QueryInfoDto} from "../../../logs/dto/query";
import {AppDetailDto} from "@global-app/app-store/dto/app-detail";
import {AppService} from "@local-app/data-review/services/app-service";
import {AppTagComponent} from "@global-app/app-store/components/app-tag/app-tag.component";

interface LearningRequestDataSelectorData {
  request: FederatedLearningRequestDto;
  cohorts: Schema[];
}


interface PatientData {
  id: string;
  cohort: string;
  cohortId: string;
}

interface FilterParams {
  search?: string;
  cohorts: string[];
}

@Component({
  selector: 'app-learning-request-data-selector-list',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogTitle,
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
    AppTagComponent
  ],
  templateUrl: './learning-request-data-selector-list.component.html',
  styleUrl: './learning-request-data-selector-list.component.scss'
})
export class LearningRequestDataSelectorListComponent implements OnInit {
  private readonly dialogRef: MatDialogRef<LearningRequestDataSelectorListComponent> = inject(MatDialogRef);
  private readonly logService: LogService = inject(LogService);
  private readonly appService: AppService = inject(AppService);
  readonly data = inject<LearningRequestDataSelectorData>(MAT_DIALOG_DATA);
  readonly project: ProjectDetailDto = this.data.request.project;

  protected readonly TrainingStatusPending = TrainingStatus.Pending;

  query?: QueryInfoDto;
  apps: AppDetailDto[] = [];

  displayedColumns: string[] = ['actions', 'name', 'patientId'];
  isLargeScreen: boolean = true;
  screenSize: string;
  patients: PatientData[] = [];
  cohorts: string[] = [];
  selectedPatients: SelectionModel<PatientData> = new SelectionModel<PatientData>(true);
  dataSource = new MatTableDataSource<PatientData>();

  selectedFilter: boolean[] = [];
  searchValue: string;

  ngOnInit(): void {

    this.project.workflow?.forEach((workflow) => {
      this.appService.getApp(workflow.federatedAppId).subscribe(app => this.apps.push(app));
    });

    this.logService.getQueryInfo(this.project.queryId).subscribe(query => this.query = query);
    this.data.request.requestPatients.forEach((requestCohort: FederatedLearningRequestPatientsDto) => {

      const cohortDetail = this.data.cohorts.find((cohortData: Schema) => cohortData.uniqueId === requestCohort.cohortId);
      if (!cohortDetail) {
        return;
      }

      this.cohorts.push(cohortDetail.name);

      requestCohort.patientIds.forEach((patientId: string) => {

        const patient: PatientData = {
          id: patientId,
          cohort: cohortDetail.name,
          cohortId: requestCohort.cohortId
        };
        this.patients.push(patient);
      });

    });
    this.dataSource.data = this.patients;
    this.dataSource.filterPredicate = this.createFilter();
    this.onSelectAll();
  }

  isAllSelected(): boolean {
    const numSelected = this.selectedPatients.selected.length;
    const numVisible = this.dataSource.filteredData.length;
    return numSelected === numVisible;
  }

  onCancel(): void {
    this.dialogRef.close();


  }

  getSelectedData(): FederatedLearningRequestPatientsDto[] {
    const currentRequest: FederatedLearningRequestPatientsDto[] = this.data.request.requestPatients;
    const selectedPatientsByCohort: { [key: string]: string[] } = {};

    this.selectedPatients.selected.forEach(patient => {
      if (!selectedPatientsByCohort[patient.cohortId]) {
        selectedPatientsByCohort[patient.cohortId] = [];
      }
      selectedPatientsByCohort[patient.cohortId].push(patient.id);
    });

    currentRequest.forEach(request => {
      if (selectedPatientsByCohort[request.cohortId]) {
        request.patientIds = selectedPatientsByCohort[request.cohortId];
      }
    });

    return currentRequest;
  }

  onAccept(): void {
    const updatedRequest = this.getSelectedData();
    this.dialogRef.close(updatedRequest);
  }

  onReject(): void {
    this.selectedPatients.clear();
    const updatedRequest = this.getSelectedData();
    this.dialogRef.close(updatedRequest);
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
    return function (data: any, filter: string): boolean {
      const searchTerms: FilterParams = JSON.parse(filter);
      const search = searchTerms.search;
      const cohorts = searchTerms.cohorts;
      const matchesSearch = !search || data.id.toLowerCase().includes(search) || data.cohort.toLowerCase().includes(search);
      const matchesCohort = cohorts.length === 0 || cohorts.includes(data.cohort);

      return matchesSearch && matchesCohort;
    }
  }


  getApps(): AppDetailDto[] {
    return this.apps.sort((a, b) => {
      const orderA = this.project.workflow!.find(workflow => workflow.federatedAppId === a.id)?.orderValue || 0;
      const orderB = this.project.workflow!.find(workflow => workflow.federatedAppId === b.id)?.orderValue || 0;
      return orderA - orderB;
    });  }

}
