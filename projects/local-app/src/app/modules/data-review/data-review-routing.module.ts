import {RouterModule, Routes} from '@angular/router';
import {DataReviewComponent} from './data-review.component';
import {NgModule} from '@angular/core';
import {DataReviewDashboardComponent} from './components/data-review-dashboard/data-review-dashboard.component';
import {permissionListResolver} from '@local-app/data-review/services/permission-resolver.service';
import {cohortListResolver} from '@local-app/cohort/services/cohort-resolver.service';
import {TrainingGridComponent} from "@local-app/data-review/components/training-grid/training-grid.component";
import {PermissionGridComponent} from "@local-app/data-review/components/permission-grid/permission-grid.component";
import {StatisticsGridComponent} from "@local-app/data-review/components/statistics-grid/statistics-grid.component";
import {MetricsGridComponent} from "@local-app/data-review/components/metrics-grid/metrics-grid.component";

const routes: Routes = [
  {
    path: '',
    component: DataReviewComponent,
    children: [
      {
        path: '',
        component: DataReviewDashboardComponent,
        resolve: {permissions: permissionListResolver, cohorts: cohortListResolver},
      },
      {
        path: 'permissions',
        component: PermissionGridComponent,
        resolve: {permissions: permissionListResolver, cohorts: cohortListResolver},
        data: {breadcrumb: 'Access Management'},
      },
      {
        path: 'training',
        component: TrainingGridComponent,
        resolve: {permissions: permissionListResolver, cohorts: cohortListResolver},
        data: {breadcrumb: 'Training Requests'},
      },
      {
        path: 'statistics',
        component: StatisticsGridComponent,
        resolve: {cohorts: cohortListResolver},
        data: {breadcrumb: 'Statistics Requests'},
      },
      {
        path: 'metrics',
        component: MetricsGridComponent,
        data: {breadcrumb: 'Metrics Requests'},
      },
    ],
  }
]

@NgModule({
  imports: [
    RouterModule.forChild(routes),
  ],
  exports: [
    RouterModule,
  ],
})
export class DataReviewRoutingModule {
}
