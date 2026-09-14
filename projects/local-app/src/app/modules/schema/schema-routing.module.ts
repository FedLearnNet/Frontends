import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {SchemaComponent} from './schema.component';
import {SchemaOverviewComponent} from './components/schema-overview/schema-overview.component';
import {SchemaDetailPageComponent} from './components/schema-detail-page/schema-detail-page.component';
import {
  SchemaNodeDetailPageComponent
} from './components/schema-node-detail-page/schema-node-detail-page.component';
import {
  globalSchemaListResolver,
  globalSchemaResolver,
  schemaNodeResolver
} from './services/schema-overview-resolver.service';

const routes: Routes = [
  {
    path: '',
    component: SchemaComponent,
    children: [
      {
        path: '',
        component: SchemaOverviewComponent,
        pathMatch: 'full',
        resolve: {schemas: globalSchemaListResolver},
      },
      {
        path: 'node/:nodeId',
        component: SchemaNodeDetailPageComponent,
        resolve: {node: schemaNodeResolver},
        data: {breadcrumb: (data: any) => data.node?.name ?? 'Node'},
      },
      {
        path: ':schemaId',
        component: SchemaDetailPageComponent,
        resolve: {schema: globalSchemaResolver},
        data: {breadcrumb: (data: any) => data.schema?.name ?? 'Schema'},
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SchemaRoutingModule {
}
