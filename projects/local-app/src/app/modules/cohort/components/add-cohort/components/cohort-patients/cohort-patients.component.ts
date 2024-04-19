import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CohortPatient } from '@local-app/cohort/models';
import { MatDialog } from '@angular/material/dialog';
import { PatientDetailComponent } from './components/patient-detail/patient-detail.component';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ConfirmDialogComponent } from '@shared-lib/components/confirm-dialog/confirm-dialog.component';
import { CohortService } from '@local-app/cohort/services/cohort.service';
import { SelectOption } from '@shared-lib/models';
import { ResponsiveService } from '@shared-lib/services/responsive.service';
import { XSMALL } from '@shared-lib/constants';
import { cloneDeep, isEmpty } from 'lodash';
import { PatientDataStatus } from '@local-app/cohort/enums';


@Component({
  selector: 'app-cohort-patients',
  templateUrl: './cohort-patients.component.html',
  styleUrl: './cohort-patients.component.scss',
})
export class CohortPatientsComponent {
  @Input() cohortPatients: CohortPatient[];
  @Input() cohortQueriabilityForm: FormGroup;
  @Output() cohortPatientsChange = new EventEmitter<CohortPatient[]>();

  isXSmallScreen: boolean = false;
  displayedColumns: string[] = ['actions', 'id', 'files', 'dietaryScore', 'colorectalCancer'];
  queriabilityOptions: SelectOption[];

  patientDetailForm = this.formBuilder.nonNullable.group({
    id: [null],
    age: [null, Validators.required],
    files: [[]],
    dietaryScore: [null, Validators.required],
    colorectalCancer: [null, Validators.required],
    recordStatus: [],
    patientId: [],
  });

  constructor(
      public dialog: MatDialog,

      private formBuilder: FormBuilder,
      private cohortService: CohortService,
      private responsiveService: ResponsiveService,
  ) {}

  ngOnInit(): void {
    this.loadQueriabilityOptions();

    this.cohortQueriabilityForm.enable();

    this.checkAndAdjustResponsiveLayout();
  }

  checkAndAdjustResponsiveLayout(): void {
    this.responsiveService
        .getScreenSize()
        .subscribe(screenSize => this.isXSmallScreen = screenSize === XSMALL);
  }

  openPatientDetailModal(): void {
   const dialogRef = this.dialog.open(PatientDetailComponent, {
     minWidth: '40%',
     data: {
       patients: this.cohortPatients,
       patientData: this.patientDetailForm,
     },
   });

   dialogRef.afterClosed().subscribe((patientDetail) => {
     this.submitPatientToCohort(patientDetail);

     this.patientDetailForm.reset();
   })
  }

  editRow(element: any): void {
    this.patientDetailForm.patchValue(element);

    this.openPatientDetailModal();
  }

  deleteRow(patient: any): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Delete patient',
        message: 'Are you sure you want to delete this patient?',
        dismissButtonText: 'Cancel',
        confirmButtonText: 'Delete',
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (!result) return;

      this.deletePatient(patient.id, patient.patientId);
    });
  }

  getFilesName(files: File[]): string {
    if (isEmpty(files)) return '';

    return files.map(file => file.name).join('\n');
  }

  submitPatientToCohort(patient: CohortPatient): void {
    if (!patient) return;

    if (this.isPatientUpdate(patient)) {
      this.cohortPatients = cloneDeep(this.cohortService.updatePatient(patient, this.cohortPatients));
    } else {
      this.cohortPatients = cloneDeep(this.cohortService.createPatient(patient, this.cohortPatients));
    }

    this.cohortPatientsChange.emit(this.cohortPatients);
  }

  deletePatient(id: number, patientId: number): void {
    this.cohortPatients = this.cohortService.deletePatient(id, patientId, this.cohortPatients);

    this.cohortPatientsChange.emit(this.cohortPatients);
  }

  loadQueriabilityOptions(): void {
    this.cohortService.getQueriabilityOptions()
        .subscribe(queriabilityOptions => this.queriabilityOptions = queriabilityOptions);
  }

  getCohortPatients(): CohortPatient[] {
    return this.cohortPatients.filter(patient => patient?.recordStatus !== PatientDataStatus.DELETED);
  }

  isPatientUpdate(patient: CohortPatient): boolean {
    if (patient.id) {
      return true;
    }

    return patient.recordStatus === PatientDataStatus.UPDATED
        || patient.recordStatus === PatientDataStatus.CREATED;
  }
}
