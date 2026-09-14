import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {ADMIN_REALM_ROLE, AuthGuard} from "@shared-lib/services/keycloak";
import {AdminCenterComponent} from "./components/admin-center/admin-center.component";
import {HealthDashboardComponent} from "./components/health-dashboard/health-dashboard.component";
import {AdminDockerDashboardComponent} from "./components/admin-docker-dashboard/admin-docker-dashboard.component";
import {
  AdminDockerContainerDetailComponent
} from "./components/admin-docker-container-detail/admin-docker-container-detail.component";

const routes: Routes = [
  {
    path: '',
    canActivate: [AuthGuard],
    data: {role: ADMIN_REALM_ROLE},
    children: [
      {
        path: '',
        pathMatch: 'full',
        data: {breadcrumb: 'Admin-Center'},
        component: AdminCenterComponent
      },
      {
        path: 'orch',
        data: {breadcrumb: 'Orchestration'},
        component: AdminDockerDashboardComponent
      },
      {
        path: 'orch/container/:containerId',
        pathMatch: 'full',
        data: {breadcrumb: 'Container'},
        component: AdminDockerContainerDetailComponent
      },
      {
        path: 'health',
        data: {breadcrumb: 'Health'},
        component: HealthDashboardComponent
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminRoutingModule {
}
