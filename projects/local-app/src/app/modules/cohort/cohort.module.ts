import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CohortComponent } from '@local-app/cohort/cohort.component';
import { CohortDashboardComponent } from '@local-app/cohort/components/cohort-dashboard/cohort-dashboard.component';
import { CohortOverviewComponent } from '@local-app/cohort/components/cohort-overview/cohort-overview.component';
import { CohortDetailComponent } from '@local-app/cohort/components/cohort-detail/cohort-detail.component';
import { CohortPatientsComponent } from '@local-app/cohort/components/cohort-patients/cohort-patients.component';
import { CohortRoutingModule } from '@local-app/cohort/cohort-routing.module';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import { MatDividerModule } from '@angular/material/divider';
import { MatMenuModule } from '@angular/material/menu';
import { SharedLibModule } from '@shared-lib/shared-lib.module';
import { PatientDetailDynamicFormComponent } from '@local-app/cohort/components/patient-detail-dynamic-form/patient-detail-dynamic-form.component';
import { DynamicFormComponent } from '@local-app/cohort/components/dynamic-form/dynamic-form.component';
import { MatRadioModule } from '@angular/material/radio';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatExpansionModule } from '@angular/material/expansion';
import { GroupListComponent } from '@local-app/cohort/components/group-list/group-list.component';
import { MatTabsModule } from '@angular/material/tabs';
import { PatientDetailQueryabilityFormComponent } from '@local-app/cohort/components/patient-detail-queryability-form/patient-detail-queryability-form.component';
import { SchemaListComponent } from '@local-app/cohort/components/schema-list/schema-list.component';
import { MatCardModule } from '@angular/material/card';
import { MatGridListModule } from '@angular/material/grid-list';
import { PatientDetailGridSettingsComponent } from '@local-app/cohort/components/patient-detail-grid-settings/patient-detail-grid-settings.component';
import { MatTreeModule } from '@angular/material/tree';

@NgModule({
  declarations: [
    CohortComponent,
    CohortDashboardComponent,
    CohortOverviewComponent,
    CohortDetailComponent,
    CohortPatientsComponent,
    PatientDetailDynamicFormComponent,
    DynamicFormComponent,
    GroupListComponent,
    PatientDetailQueryabilityFormComponent,
    SchemaListComponent,
    PatientDetailGridSettingsComponent,
  ],
  imports: [
    CommonModule,
    CohortRoutingModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    FormsModule,
    MatInputModule,
    MatDialogModule,
    MatSelectModule,
    MatDividerModule,
    MatMenuModule,
    SharedLibModule,
    MatRadioModule,
    MatCheckboxModule,
    MatExpansionModule,
    MatTabsModule,
    MatGridListModule,
    MatCardModule,
    MatTreeModule,
  ],
  providers: []
})
export class CohortModule { }
