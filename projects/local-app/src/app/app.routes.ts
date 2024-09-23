import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {DashboardComponent} from './utils/components/dashboard/dashboard.component';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    component: DashboardComponent,
  },
  {
    path: 'cohort',
    loadChildren: () =>
      import('../app/modules/cohort/cohort.module').then(m => m.CohortModule),
    data: {breadcrumb: 'Cohort'},
  },
  {
    path: 'data-review',
    loadChildren: () =>
      import('../app/modules/data-review/data-review.module').then(m => m.DataReviewModule),
    data: {breadcrumb: 'Data Review'},
  },
  {
    path: 'cohort/:schemaId/connector',
    loadChildren: () =>
      import('../app/modules/connector/connector.module').then(m => m.ConnectorModule),
    data: {breadcrumb: 'Connector'},
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    bindToComponentInputs: true,
    paramsInheritanceStrategy: 'always'
  })],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
