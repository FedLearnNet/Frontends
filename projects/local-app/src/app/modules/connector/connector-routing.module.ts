import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {ConnectorComponent} from "./connector.component";
import {ManageConnectorComponent} from "./components/manage-connector/manage-connector.component";
import {ListConnectorComponent} from "./components/list-connector/list-connector.component";
import {ViewConnectorComponent} from "./components/view-connector/view-connector.component";
import {connectorAndFileResolver, connectorResolver} from "./services/connector-resolver.service";
import {ConnectorManagementMode} from "./enum/connector-managment-mode";
import {RunConnectorViewComponent} from "./components/run-connector/run-connector.component";
import {runResolver} from "./services/run-resolver.service";
import {schemaResolver} from "@local-app/cohort/services/schema-resolver.service";
import {AuthGuard} from "@shared-lib/services/keycloak";

const routes: Routes = [
  {
    path: '',
    component: ConnectorComponent,
    resolve: {schema: schemaResolver},
    children: [
      {
        path: '',
        component: ListConnectorComponent,
        pathMatch: 'full',
        data: {breadcrumb: (data: any) => data.schema.name},
      },
      {
        path: 'new',
        component: ManageConnectorComponent,
        resolve: {},
        data: {breadcrumb: 'New', mode: ConnectorManagementMode.NEW},
      },
      {
        path: 'new/empty',
        component: ManageConnectorComponent,
        resolve: {},
        data: {breadcrumb: 'New', mode: ConnectorManagementMode.EMPTY},
      },

      {
        path: 'new/clear',
        component: ManageConnectorComponent,
        resolve: {},
        data: {breadcrumb: 'New', mode: ConnectorManagementMode.CLEAR},
      },
      {
        path: 'new/:connector-id',
        component: ManageConnectorComponent,
        resolve: {
          schema: schemaResolver,
          connector: connectorAndFileResolver,
        },
        data: {
          breadcrumb: (data: any) => data.connector.name,
          mode: ConnectorManagementMode.DUPLICATE,
        },
      },
      {
        path: 'edit/:connector-id',
        component: ManageConnectorComponent,
        resolve: {
          connector: connectorAndFileResolver,
        },
        data: {breadcrumb: (data: any) => data.connector.name, mode: ConnectorManagementMode.EDIT},
      },
      {
        path: 'view/:connector-id',
        component: ViewConnectorComponent,
        resolve: {
          connector: connectorResolver,
        },
        data: {breadcrumb: (data: any) => data.connector.name},
      },
      {
        path: 'view/:connector-id/run/:run-id',
        component: RunConnectorViewComponent,
        resolve: {
          run: runResolver,
          connector: connectorResolver,
        },
        data: {breadcrumb: (data: any) => data.run.id},
      },
    ],
  }
];

@NgModule({
  imports: [
    RouterModule.forChild(routes),
  ],
  exports: [
    RouterModule,
  ],
})
export class ConnectorRoutingModule {
}
