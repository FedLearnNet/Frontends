import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CohortComponent } from '@local-app/cohort/cohort.component';
import { CohortDashboardComponent } from '@local-app/cohort/components/dashboard/dashboard.component';
import { AddCohortComponent } from '@local-app/cohort/components/add-cohort/add-cohort.component';
import { CohortDetailComponent } from '@local-app/cohort/components/cohort-detail/cohort-detail.component';
import { CohortPatientsComponent } from '@local-app/cohort/components/add-cohort/components/cohort-patients/cohort-patients.component';
import { PatientDetailComponent } from '@local-app/cohort/components/add-cohort/components/cohort-patients/components/patient-detail/patient-detail.component';
import { CohortConfirmationComponent } from '@local-app/cohort/components/cohort-confirmation/cohort-confirmation.component';
import { ConfirmPatientDetailComponent } from '@local-app/cohort/components/cohort-confirmation/components/confirm-patient-detail/confirm-patient-detail.component';
import { ShowCohortComponent } from '@local-app/cohort/components/show-cohort/show-cohort.component';
import { CohortRoutingModule } from '@local-app/cohort/cohort-routing.module';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatStepperModule } from '@angular/material/stepper';
import { MatInputModule } from '@angular/material/input';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import { MatDividerModule } from '@angular/material/divider';
import { MatMenuModule } from '@angular/material/menu';
import { CohortService } from '@local-app/cohort/services/cohort.service';
import { SharedLibModule } from '@shared-lib/shared-lib.module';

@NgModule({
  declarations: [
    CohortComponent,
    CohortDashboardComponent,
    AddCohortComponent,
    CohortDetailComponent,
    CohortPatientsComponent,
    PatientDetailComponent,
    CohortConfirmationComponent,
    ConfirmPatientDetailComponent,
    ShowCohortComponent,
  ],
  imports: [
    CommonModule,
    CohortRoutingModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatStepperModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    FormsModule,
    MatInputModule,
    MatDialogModule,
    MatSelectModule,
    MatDividerModule,
    MatMenuModule,
    SharedLibModule,
  ],
  providers: [
    CohortService,
  ]
})
export class CohortModule { }
