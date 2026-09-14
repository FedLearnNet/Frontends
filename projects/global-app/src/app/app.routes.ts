import {Routes} from '@angular/router';
import {ADMIN_REALM_ROLE, AllowDataModelingRouteGuard, AuthGuard} from "@shared-lib/services/keycloak";
import {DashboardComponent} from "@global-app/utils/components/dashboard/dashboard.component";
import {
  ModelWorkflowDetailComponent
} from "@global-app/model-store/components/model-workflow-detail/model-workflow-detail.component";
import {
  ModelWorkflowOverviewComponent
} from "@shared-lib/modules/app-execution/components/model-workflow-overview/model-workflow-overview.component";
import {
  modelWorkflowResolver,
  modelWorkflowsResolver
} from "@shared-lib/modules/app-execution/service/model-workflow-resolver.service";

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    component: DashboardComponent,
  },
  {
    path: 'find-data',
    loadChildren: () =>
      import('../app/modules/find-data/find-data-routing.module').then(m => m.FindDataRoutingModule),
    canActivate: [AuthGuard, AllowDataModelingRouteGuard]
  },
  {
    path: 'model',
    loadChildren: () =>
      import('../app/modules/model-store/model-routing.module').then(m => m.ModelListRoutingModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'project',
    loadChildren: () =>
      import('../app/modules/project/project-routing.module').then(m => m.ProjectRoutingModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'admin',
    data: {breadcrumb: 'Admin', role: ADMIN_REALM_ROLE},
    loadChildren: () =>
      import('../app/modules/admin/admin-routing.module').then(m => m.AdminRoutingModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'store',
    loadChildren: () =>
      import('../app/modules/store/store-routing.module').then(m => m.StoreRoutingModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'tool-graph',
    loadChildren: () =>
      import('../app/modules/store/store-routing.module').then(m => m.StoreGraphRoutingModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'tool-audit',
    loadChildren: () =>
      import('../app/modules/store/store-routing.module').then(m => m.StoreAuditRoutingModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'data-modelling',
    loadChildren: () =>
      import('../app/modules/schema/schema-routing.module').then(m => m.SchemaRoutingModule),
    canActivate: [AuthGuard, AllowDataModelingRouteGuard]
  },
  {
    path: 'experiment',
    resolve: {models: modelWorkflowsResolver},
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        component: ModelWorkflowOverviewComponent,
        pathMatch: 'full'
      },
      {
        path: ':workflow-id',
        component: ModelWorkflowDetailComponent,
        resolve: {modelWorkflow: modelWorkflowResolver},
        pathMatch: 'full'
      }
    ],
  },
  {
    path: 'app',
    data: {breadcrumb: 'Apps'},
    loadChildren: () =>
      import('./modules/tool-development/test-app-routing.module').then(m => m.TestAppRoutingModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'workflow',
    data: {breadcrumb: 'Workflows'},
    loadChildren: () =>
      import('../app/modules/workflow/workflow-routing.module').then(m => m.WorkflowRoutingModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'files',
    data: {breadcrumb: 'Files'},
    loadChildren: () =>
      import('../app/modules/files/files-routing.module').then(m => m.FilesRoutingModule),
    canActivate: [AuthGuard]
  },
];
