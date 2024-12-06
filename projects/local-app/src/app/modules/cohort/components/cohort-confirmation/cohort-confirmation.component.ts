import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { CohortPatient } from '@local-app/cohort/models';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmPatientDetailComponent } from './components/confirm-patient-detail/confirm-patient-detail.component';
import { CohortService } from '@local-app/cohort/services/cohort.service';
import { FormGroup } from '@angular/forms';
import { SelectOption } from '@shared-lib/models';
import { ResponsiveService } from '@shared-lib/services/responsive.service';
import { XSMALL } from '@shared-lib/constants';
import { isEmpty } from 'lodash';
import { PatientDataStatus } from '@local-app/cohort/enums';

@Component({
  selector: 'app-cohort-confirmation',
  templateUrl: './cohort-confirmation.component.html',
  styleUrl: './cohort-confirmation.component.scss',
})
export class CohortConfirmationComponent implements OnInit {
  @Input() confirmButtonLabel: string = 'Confirm';
  @Input() cohortPatients: CohortPatient[];
  @Input() cohortQueriabilityForm: FormGroup;
  @Output() confirmCohort = new EventEmitter<void>();

  isXSmallScreen: boolean = false;
  displayedColumns: string[] = ['actions', 'id', 'files', 'dietaryScore', 'colorectalCancer'];
  queriabilityOptions: SelectOption[];

  constructor(
      public dialog: MatDialog,

      private cohortService: CohortService,
      private responsiveService: ResponsiveService,
  ) { }

  ngOnInit(): void {
    this.loadQueriabilityOptions();
    this.checkAndAdjustResponsiveLayout();
  }

  checkAndAdjustResponsiveLayout(): void {
    this.responsiveService
        .getScreenSize()
        .subscribe(screenSize => this.isXSmallScreen = screenSize === XSMALL);
  }

  getFilesName(files: File[]): string {
    if (isEmpty(files)) return '';

    return files.map(file => file.name).join('\n');
  }

  triggerCohortConfirm() {
    this.confirmCohort.emit();
  }

  showRow(element: any): void {
    this.dialog.open(ConfirmPatientDetailComponent, {
      minWidth: '40%',
      data: {
        patientData: this.cohortPatients.find(patient => patient.id === element.id),
      },
    });
  }

  loadQueriabilityOptions(): void {
    this.cohortService.getQueriabilityOptions()
        .subscribe(queriabilityOptions => this.queriabilityOptions = queriabilityOptions);
  }

  getCohortPatients(): CohortPatient[] {
    return this.cohortPatients.filter(patient => patient?.recordStatus !== PatientDataStatus.DELETED);
  }
}
