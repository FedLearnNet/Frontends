import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {DashboardComponent} from '@global-app/utils/components/dashboard/dashboard.component';
import {AllowDataModelingRouteGuard, AuthGuard} from "@shared-lib/services/keycloak";
import {TestAppRoutingModule} from "./modules/test-app/test-app-routing.module";
import {ModelStoreRoutingModule} from "@global-app/model-store/model-store-routing.module";
import {ModelListRoutingModule} from "@global-app/model-store/model-routing.module";
import {environment} from "@global-app/env/environment";

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
    path: 'predictions',
    loadChildren: () =>
      import('../app/modules/model-store/predictions-routing.module').then(m => m.PredictionsRoutingModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'model-store',
    loadChildren: () =>
      import('../app/modules/model-store/model-store-routing.module').then(m => m.ModelStoreRoutingModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'project',
    loadChildren: () =>
      import('../app/modules/project/project.module').then(m => m.ProjectModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'app-store',
    loadChildren: () =>
      import('../app/modules/app-store/app-store.module').then(m => m.AppStoreModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'data-modelling',
    loadChildren: () =>
      import('../app/modules/schema/schema.module').then(m => m.SchemaModule),
    canActivate: [AuthGuard, AllowDataModelingRouteGuard]
  },

  {
    path: 'app',
    data: {breadcrumb: 'Apps'},
    loadChildren: () =>
      import('../app/modules/test-app/test-app-routing.module').then(m => m.TestAppRoutingModule),
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
