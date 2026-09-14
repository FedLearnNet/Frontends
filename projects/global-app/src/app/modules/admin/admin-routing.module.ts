import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {ADMIN_REALM_ROLE, AuthGuard} from "@shared-lib/services/keycloak";
import {AdminCenterComponent} from './components/admin-center/admin-center.component';
import {AdminDockerDashboardComponent} from './components/admin-docker-dashboard/admin-docker-dashboard.component';
import {AdminDockerContainerDetailComponent} from './components/admin-docker-container-detail/admin-docker-container-detail.component';
import {AdminFLNetClientObserverComponent} from './components/admin-flnet-client-observer/admin-flnet-client-observer.component';

const routes: Routes = [
  {
    path: '',
    canActivate: [AuthGuard],
    data: {role: ADMIN_REALM_ROLE},
    children: [
      {
        path: '',
        pathMatch: 'full',
        data: {breadcrumb: 'Admin'},
        component: AdminCenterComponent
      },
      {
        path: 'orch',
        pathMatch: 'full',
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
        path: 'observer',
        pathMatch: 'full',
        data: {breadcrumb: 'WS Observer'},
        component: AdminFLNetClientObserverComponent
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminRoutingModule {
}
