import {Routes} from '@angular/router';
import {ADMIN_REALM_ROLE, AuthGuard} from "@shared-lib/services/keycloak";
import {DashboardComponent} from "@local-app/utils/components/dashboard/dashboard.component";

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    component: DashboardComponent,
    data: {
      breadcrumb: 'Home',
    },
  },
  {
    path: 'cohort',
    loadChildren: () =>
      import('../app/modules/cohort/cohort-routing.module').then(m => m.CohortRoutingModule),
    data: {
      breadcrumb: 'Cohorts',
    },
    canActivate: [AuthGuard]
  },
  {
    path: 'data-review',
    loadChildren: () =>
      import('../app/modules/data-review/data-review-routing.module').then(m => m.DataReviewRoutingModule),
    data: {breadcrumb: 'Data Review'},
    canActivate: [AuthGuard]
  },
  {
    path: 'training',
    loadChildren: () =>
      import('./modules/training/training-routing.module').then(m => m.TrainingRoutingModule),
    data: {breadcrumb: 'Trainings'},
    canActivate: [AuthGuard]
  },
  {
    path: 'information',
    loadChildren: () =>
      import('../app/modules/information/information-routing.module').then(m => m.InformationRoutingModule),
    data: {breadcrumb: 'Notifications'},
    canActivate: [AuthGuard]
  },
  {
    path: 'logs',
    loadChildren: () =>
      import('../app/modules/logs/log-routing.module').then(m => m.LogRoutingModule),
    data: {breadcrumb: 'Logs'},
    canActivate: [AuthGuard]
  },
  {
    path: 'schema',
    loadChildren: () =>
      import('../app/modules/schema/schema-routing.module').then(m => m.SchemaRoutingModule),
    data: {breadcrumb: 'Schemas'},
    canActivate: [AuthGuard]
  },
  {
    path: 'admin',
    loadChildren: () =>
      import('../app/modules/admin/admin-routing.module').then(m => m.AdminRoutingModule),
    data: {breadcrumb: 'Admin-Center', role: ADMIN_REALM_ROLE},
    canActivate: [AuthGuard]
  },

];
