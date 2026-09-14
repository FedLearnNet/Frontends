import {RouterModule, Routes} from '@angular/router';
import {NgModule} from '@angular/core';
import {SchemaOverviewComponent} from "./components/schema-overview/schema-overview.component";
import {ListSchemaComponent} from "./components/list-schema/list-schema.component";
import {ListUMLSComponent} from "./components/list-umls/list-umls.component";
import {DetailOntologyComponent} from "./components/detail-ontology/detail-ontology.component";
import {DetailSchemaComponent} from "./components/detail-schema/detail-schema.component";
import {ListOntologiesComponent} from "./components/list-ontologies/list-ontologies.component";
import {DummyDataListComponent} from "@global-app/schema/components/dummy-data-list/dummy-data-list.component";
import {ListDatatypesComponent} from "@global-app/schema/components/list-datatypes/list-datatypes.component";
import {DetailDatatypeComponent} from "@global-app/schema/components/detail-datatype/detail-datatype.component";

const routes: Routes = [
  {
    path: '',
    data: {breadcrumb: 'Overview'},
    children: [{
      path: '',
      component: SchemaOverviewComponent,
      pathMatch: 'full'
    },
      {
        path: 'schema',
        data: {breadcrumb: 'Schema'},
        children: [{
          path: '',
          pathMatch: 'full',
          data: {breadcrumb: 'Schema'},
          component: ListSchemaComponent
        },
          {
            path: ':schemaId',
            pathMatch: 'full',
            component: DetailSchemaComponent,
            data: {breadcrumb: 'SchemaId'},
          }
        ]
      },
      {
        path: 'data',
        component: DummyDataListComponent,
        data: {breadcrumb: 'Data generation'},
      },
      {
        path: 'data-types',
        data: {breadcrumb: 'Data types'},
        children: [{
          path: '',
          pathMatch: 'full',
          component: ListDatatypesComponent,
        },
          {
            path: 'create',
            pathMatch: 'full',
            component: DetailDatatypeComponent,
            data: {breadcrumb: 'Create'},
          },
          {
            path: ':datatypeId',
            pathMatch: 'full',
            component: DetailDatatypeComponent,
            data: {breadcrumb: 'Datatype'},
          },
        ],
      },
      {
        path: 'ontology',
        data: {breadcrumb: 'Ontologies'},
        children: [{
          path: '',
          pathMatch: 'full',
          data: {breadcrumb: 'Ontologies'},
          component: ListOntologiesComponent
        },
          {
            path: 'umls',
            pathMatch: 'full',
            data: {breadcrumb: 'UMLS'},
            component: ListUMLSComponent,
          },
          {
            path: ':ontologyId',
            pathMatch: 'full',
            component: DetailOntologyComponent,
            data: {breadcrumb: 'ontologyId'},
          },
        ]
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
export class SchemaRoutingModule {
}
