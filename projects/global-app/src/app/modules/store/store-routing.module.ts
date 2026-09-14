import {RouterModule, Routes} from '@angular/router';
import {NgModule} from '@angular/core';
import {StoreListComponent} from "@shared-lib/modules/store/components/store-list/store-list.component";
import {
  appStoreGraphResolver,
  appStoreResolver,
  modelStoreResolver
} from "@shared-lib/modules/store/service/store-resolver.service";
import {
  StoreDetailAppComponent
} from "@shared-lib/modules/store/components/store-detail-app/store-detail-app.component";
import {
  StoreDetailModelComponent
} from "@shared-lib/modules/store/components/store-detail-model/store-detail-model.component";
import {
  StoreGraphListComponent
} from "@shared-lib/modules/store/components/store-graph-list/store-graph-list.component";
import {environment} from "@global-app/env/environment";
import {RedirectGuard} from "@shared-lib/services/redirect-guard";
import {AuditPendingComponent} from "../audit/components/audit-pending/audit-pending.component";
import {toolAuditResolver, toolPendingAuditResolver} from "../audit/service/audit.resolver.service";
import {AuditDetailComponent} from "../audit/components/audit-detail/audit-detail.component";
import {ADMIN_REALM_ROLE, AUDITOR_REALM_ROLE, AuthGuard} from "@shared-lib/services/keycloak";

const globalAllStoreUrl = environment.globalLearningApiUrl + "/store/all";
const routes: Routes = [
  {
    path: '',
    children: [{
      path: '',
      component: StoreListComponent,
      pathMatch: 'full'
    },
      {
        path: 'audit',
        pathMatch: 'full',
        children: [
          {
            path: '',
            component: AuditPendingComponent,
            pathMatch: 'full',
            resolve: {app: toolPendingAuditResolver},
          },
          {
            path: ':version-id',
            component: AuditDetailComponent,
            pathMatch: 'full'
          }
        ]
      },
      {
        path: 'graph',
        component: StoreGraphListComponent,
        pathMatch: 'full',
        resolve: {app: appStoreGraphResolver}
      },
      {
        path: 'json',
        canActivate: [RedirectGuard],
        component: RedirectGuard,
        data: {
          externalUrl: globalAllStoreUrl
        }
      },
      {
        path: ':app-id',
        component: StoreDetailAppComponent,
        pathMatch: 'full',
        resolve: {app: appStoreResolver}
      },
      {
        path: 'model/:model-id',
        component: StoreDetailModelComponent,
        pathMatch: 'full',
        resolve: {model: modelStoreResolver},
      },
    ],
  },
]

const graphRoutes: Routes = [
  {
    path: '',
    component: StoreGraphListComponent,
    pathMatch: 'full',
    resolve: {app: appStoreGraphResolver}

  },
]

const auditRoutes: Routes = [
  {
    canActivate: [AuthGuard],
    data: {role: AUDITOR_REALM_ROLE},
    path: '',
    children: [
      {
        path: '',
        component: AuditPendingComponent,
        pathMatch: 'full',
        resolve: {app: toolPendingAuditResolver},
      },
      {
        path: ':version-id',
        component: AuditDetailComponent,
        pathMatch: 'full',
        resolve: {app: toolAuditResolver}
      }
    ]
  },
]


@NgModule({
  imports: [
    RouterModule.forChild(routes)
  ],
  exports: [
    RouterModule,
  ],
})
export class StoreRoutingModule {
}


@NgModule({
  imports: [
    RouterModule.forChild(auditRoutes)
  ],
  exports: [
    RouterModule,
  ],
})
export class StoreAuditRoutingModule {
}

@NgModule({
  imports: [
    RouterModule.forChild(graphRoutes)
  ],
  exports: [
    RouterModule,
  ],
})
export class StoreGraphRoutingModule {
}
