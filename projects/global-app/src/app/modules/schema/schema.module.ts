import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ProjectRoutingModule} from "../project/project-routing.module";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatInputModule} from "@angular/material/input";
import {MatTableModule} from "@angular/material/table";
import {MatIconModule} from "@angular/material/icon";
import {MatMenuModule} from "@angular/material/menu";
import {MatButtonModule} from "@angular/material/button";
import {MatToolbarModule} from "@angular/material/toolbar";
import {MatTabsModule} from "@angular/material/tabs";
import {MatCardModule} from "@angular/material/card";
import {CdkDrag, CdkDropList, CdkDropListGroup} from "@angular/cdk/drag-drop";
import {AppStoreModule} from "../app-store/app-store.module";
import {MatCheckboxModule} from "@angular/material/checkbox";
import {SchemaComponent} from "./schema.component";
import {SchemaOverviewComponent} from "./components/schema-overview/schema-overview.component";
import {ListUMLSComponent} from "./components/list-umls/list-umls.component";
import {ListSchemaComponent} from "./components/list-schema/list-schema.component";
import {ListOntologiesComponent} from "./components/list-ontologies/list-ontologies.component";
import {ListDatatypesComponent} from "./components/list-datatypes/list-datatypes.component";
import {DetailSchemaComponent} from "./components/detail-schema/detail-schema.component";
import {DetailOntologyComponent} from "./components/detail-ontology/detail-ontology.component";
import {SchemaRoutingModule} from "./schema-routing.module";
import {MatProgressSpinnerModule} from "@angular/material/progress-spinner";
import {MatPaginatorModule} from "@angular/material/paginator";
import {MatListModule} from "@angular/material/list";
import {
  DetailOntologyRelationListsComponent
} from "./components/detail-ontology-relation-lists/detail-ontology-relation-lists.component";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {MatAutocompleteModule} from "@angular/material/autocomplete";
import {DatatypeCardComponent} from "./components/datatype-card/datatype-card.component";
import {SchemaCardListComponent} from "@global-app/schema/components/schema-card-list/schema-card-list.component";
import {SchemaCardComponent} from "@global-app/schema/components/schema-card/schema-card.component";
import {OntologyCardComponent} from "@global-app/schema/components/ontology-card/ontology-card.component";
import {DetailSchemaCardComponent} from "@global-app/schema/components/detail-schema-card/detail-schema-card.component";
import {MatTooltipModule} from "@angular/material/tooltip";
import {MatDialogModule} from "@angular/material/dialog";
import {MatSelectModule} from "@angular/material/select";
import {SharedLibModule} from "@shared-lib/shared-lib.module";
import {DummyDataListComponent} from "@global-app/schema/components/dummy-data-list/dummy-data-list.component";


@NgModule({
  declarations: [
    SchemaComponent,
    SchemaOverviewComponent,
    ListUMLSComponent,
    ListSchemaComponent,
    ListOntologiesComponent,
    ListDatatypesComponent,
    DetailSchemaComponent,
    DetailOntologyComponent,
    DetailOntologyRelationListsComponent,
    DatatypeCardComponent,
    SchemaCardComponent,
    SchemaCardListComponent,
    OntologyCardComponent,
    DetailSchemaCardComponent,
    DummyDataListComponent
  ],
  exports: [
    DatatypeCardComponent,
    OntologyCardComponent,
    DummyDataListComponent
  ],
  imports: [
    CommonModule,
    SchemaRoutingModule,
    MatFormFieldModule,
    MatAutocompleteModule,
    MatInputModule,
    ReactiveFormsModule,
    MatTableModule,
    MatIconModule,
    MatMenuModule,
    MatIconModule,
    MatButtonModule,
    MatToolbarModule,
    MatTabsModule,
    MatCardModule,
    CdkDropListGroup,
    CdkDropList,
    CdkDrag,
    AppStoreModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
    MatPaginatorModule,
    MatListModule,
    FormsModule,
    MatTooltipModule,
    MatDialogModule,
    MatSelectModule,
    SharedLibModule
  ]
})
export class SchemaModule {
}
