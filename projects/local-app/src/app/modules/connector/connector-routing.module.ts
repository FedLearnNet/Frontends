import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {ConnectorComponent} from "./connector.component";
import {ManageConnectorComponent} from "./components/manage-connector/manage-connector.component";
import {ListConnectorComponent} from "./components/list-connector/list-connector.component";
import {ViewConnectorComponent} from "./components/view-connector/view-connector.component";
import {connectorAndFileResolver, connectorResolver} from "./services/connector-resolver.service";
import {ConnectorManagementMode} from "./enum/connector-managment-mode";
import {RunConnectorViewComponent} from "./components/run-connector/run-connector.component";
import { runResolver } from "./services/run-resolver.service";
import {cohortResolver} from "@local-app/cohort/services/cohort-resolver.service";
import {ConnectorFileListComponent} from './components/file-list/connector-file-list.component';
import {ConnectorFileDetailComponent} from './components/file-detail/connector-file-detail.component';
import {connectorFileDetailResolver, connectorFilesResolver} from './services/connector-file-resolver.service';

const routes: Routes = [
  {
    path: '',
    component: ConnectorComponent,
    children: [
      {
        path: '',
        component: ListConnectorComponent,
        pathMatch: 'full',
      },
      {
        path: 'new',
        component: ManageConnectorComponent,
        resolve: {},
        data: {
          breadcrumb: 'New',
          mode: ConnectorManagementMode.NEW,
        },
      },
      {
        path: 'new/:connector-id',
        component: ManageConnectorComponent,
        resolve: {
          cohort: cohortResolver,
          connector: connectorAndFileResolver,
        },
        data: {
          breadcrumb: 'New',
          mode: ConnectorManagementMode.DUPLICATE,
        },
      },
      {
        path: 'files',
        component: ConnectorFileListComponent,
        resolve: {
          files: connectorFilesResolver,
        },
        data: {
          breadcrumb: 'Files',
        },
      },
      {
        path: 'files/:fileId',
        component: ConnectorFileDetailComponent,
        resolve: {
          file: connectorFileDetailResolver,
        },
        data: {
          breadcrumb: (data: any) => data.file?.fileName ?? 'File',
        },
      },
      {
        path: 'edit/:connector-id',
        component: ManageConnectorComponent,
        resolve: {
          connector: connectorAndFileResolver,
        },
        data: {breadcrumb: (data: any) => data.connector.name, mode: ConnectorManagementMode.EDIT},
        runGuardsAndResolvers: 'paramsOrQueryParamsChange',
      },
      {
        path: 'view/:connector-id',
        resolve: {
          connector: connectorResolver,
        },
        data: { breadcrumb: (data: any) => data.connector.name },
        children: [
          {
            path: '',
            pathMatch: 'full',
            component: ViewConnectorComponent,
            resolve: {
              connector: connectorResolver,
            },
          },
          {
            path: 'run/:run-id',
            component: RunConnectorViewComponent,
            resolve: {
              run: runResolver,
              connector: connectorResolver,
            },
            data: { breadcrumb: (data: any) => `Run ${data.run.id}` },
          },
        ],
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
