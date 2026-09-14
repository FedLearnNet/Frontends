import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {CohortComponent} from './cohort.component';
import {CohortCreateComponent} from './components/cohort-create/cohort-create.component';
import {CohortDashboardComponent} from './components/cohort-dashboard/cohort-dashboard.component';
import {CohortOverviewComponent} from './components/cohort-overview/cohort-overview.component';
import {cohortListResolver, cohortResolver} from '@local-app/cohort/services/cohort-resolver.service';
import {schemaHeadListResolver} from '@local-app/cohort/services/schema-resolver.service';
import {cohortDataListResolver} from '@local-app/cohort/services/cohort-data-resolver.service';
import {PatientDetailComponent} from "../patient/components/patient-detail/patient-detail.component";
import {PatientFormComponent} from "../patient/components/patient-form/patient-form.component";
import {patientUnsavedChangesGuard} from "../patient/guards/patient-unsaved-changes.guard";
import {patientResolver} from "../patient/service/patient-resolver.service";

const routes: Routes = [
  {
    path: '',
    component: CohortComponent,
    children: [
      {
        path: '',
        component: CohortDashboardComponent,
        pathMatch: 'full',
        resolve: {cohorts: cohortListResolver},
      },
      {
        path: 'new',
        component: CohortCreateComponent,
        resolve: {schemaHeadList: schemaHeadListResolver},
        data: {breadcrumb: 'New'},
      },
      {
        path: ':cohortId',
        resolve: {cohort: cohortResolver},
        data: {breadcrumb: (data: any) => data.cohort.name},
        children: [
          {
            path: '',
            component: CohortOverviewComponent,
            resolve: {allData: cohortDataListResolver},
          },
          {
            path: 'patient/new',
            component: PatientFormComponent,
            canDeactivate: [patientUnsavedChangesGuard],
            data: {
              breadcrumb: 'Add Patient',
              mode: 'create',
            },
          },
          {
            path: 'patient/:patientId',
            component: PatientDetailComponent,
            resolve: {patient: patientResolver},
            canDeactivate: [patientUnsavedChangesGuard],
            data: {
              breadcrumb: (data: any) => data.patient?.externalPatientId ?? `Patient ${data.patient?.id}`
            },
          },
          {
            path: 'connector',
            loadChildren: () =>
              import('../../modules/connector/connector-routing.module').then(m => m.ConnectorRoutingModule),
            data: {breadcrumb: 'Connectors'},
          },
        ]
      },
    ],
  }
];

@NgModule({
  imports: [
    RouterModule.forChild(routes),
  ],
  exports: [
    RouterModule,
  ],
})
export class CohortRoutingModule {
}
