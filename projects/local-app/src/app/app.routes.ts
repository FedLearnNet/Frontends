import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {DashboardComponent} from './utils/components/dashboard/dashboard.component';
import {AuthGuard} from "@shared-lib/services/keycloak";
import {LogRoutingModule} from "./modules/logs/log-routing.module";

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    component: DashboardComponent,
  },
  {
    path: 'cohort/:schemaId/connector',
    loadChildren: () =>
      import('../app/modules/connector/connector.module').then(m => m.ConnectorModule),
    data: {breadcrumb: 'Connector'},
    canActivate: [AuthGuard]
  },
  {
    path: 'cohort',
    loadChildren: () =>
      import('../app/modules/cohort/cohort.module').then(m => m.CohortModule),
    data: {breadcrumb: 'Cohort'},
    canActivate: [AuthGuard]
  },
  {
    path: 'data-review',
    loadChildren: () =>
      import('../app/modules/data-review/data-review.module').then(m => m.DataReviewModule),
    data: {breadcrumb: 'Data Review'},
    canActivate: [AuthGuard]
  },

  {
    path: 'logs',
    loadChildren: () =>
      import('../app/modules/logs/log-routing.module').then(m => m.LogRoutingModule),
    data: {breadcrumb: 'Logs'},
    canActivate: [AuthGuard]
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    bindToComponentInputs: true,
    enableTracing: true,
    paramsInheritanceStrategy: 'always'
  })],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
