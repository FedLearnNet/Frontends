import {RouterModule, Routes} from '@angular/router';
import {DataReviewComponent} from './data-review.component';
import {NgModule} from '@angular/core';
import {DataReviewDashboardComponent} from './components/data-review-dashboard/data-review-dashboard.component';
import {permissionListResolver} from '@local-app/data-review/services/permission-resolver.service';
import {schemaListResolver} from '@local-app/cohort/services/schema-resolver.service';
import {TrainingGridComponent} from "@local-app/data-review/components/training-grid/training-grid.component";
import {PermissionGridComponent} from "@local-app/data-review/components/permission-grid/permission-grid.component";

const routes: Routes = [
  {
    path: '',
    component: DataReviewComponent,
    children: [
      {
        path: '',
        component: DataReviewDashboardComponent,
        resolve: {permissions: permissionListResolver, cohorts: schemaListResolver},
      },
      {
        path: 'permissions',
        component: PermissionGridComponent,
        resolve: {permissions: permissionListResolver, cohorts: schemaListResolver},
      },
      {
        path: 'training',
        component: TrainingGridComponent,
        resolve: {permissions: permissionListResolver, cohorts: schemaListResolver},
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
