import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {ProjectComponent} from "./project.component";
import {ProjectRoutingModule} from "./project-routing.module";
import {DetailProjectComponent} from "./components/detail-project/detail-project.component";
import {CreateDatasetsComponent} from "./components/detail-project/components/datasets/create-datasets/create-datasets.component";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatInputModule} from "@angular/material/input";
import {MatTableModule} from "@angular/material/table";
import {MatIconModule} from "@angular/material/icon";
import {MatMenuModule} from "@angular/material/menu";
import {MatButtonModule} from "@angular/material/button";
import {ProjectListsComponent} from "./components/list-projects/list-projects.component";
import {MatToolbarModule} from "@angular/material/toolbar";
import {CreateProjectComponent} from "./components/create-project/create-project.component";
import {MatTabsModule} from "@angular/material/tabs";
import {MatCardModule} from "@angular/material/card";
import {
  DetailProjectOverviewComponent
} from "./components/detail-project/components/detail-project-overview/detail-project-overview.component";
import {CdkDrag, CdkDropList, CdkDropListGroup} from "@angular/cdk/drag-drop";
import {
  DetailProjectWorkflowComponent
} from "./components/detail-project/components/detail-project-workflow/detail-project-workflow.component";
import {AppStoreModule} from "../app-store/app-store.module";
import {MatCheckboxModule} from "@angular/material/checkbox";
import {SchemaModule} from "@global-app/schema/schema.module";
import {
    ProjectRunsComponent
} from "@global-app/project/components/detail-project/components/project-runs/project-runs.component";
import {SelectQueryComponent} from "@global-app/find-data/components/select-query/select-query.component";
import {MatDivider} from "@angular/material/divider";
import {ReactiveFormsModule} from "@angular/forms";
import {MatDialogActions, MatDialogClose, MatDialogContent, MatDialogTitle} from "@angular/material/dialog";



@NgModule({
  declarations: [
    ProjectComponent,
    DetailProjectComponent,
    CreateDatasetsComponent,
    ProjectListsComponent,
    DetailProjectOverviewComponent,
    DetailProjectWorkflowComponent
  ],
    imports: [
        CommonModule,
        ProjectRoutingModule,
        MatFormFieldModule,
        MatInputModule,
        MatTableModule,
        MatIconModule,
        MatMenuModule,
        MatButtonModule,
        MatToolbarModule,
        MatTabsModule,
        MatCardModule,
        CdkDropListGroup,
        CdkDropList,
        CdkDrag,
        AppStoreModule,
        MatCheckboxModule,
        SchemaModule,
        ProjectRunsComponent,
        SelectQueryComponent,
        MatDivider,
        ReactiveFormsModule,
        MatDialogActions,
        MatDialogClose,
        MatDialogContent,
        MatDialogTitle
    ]
})
export class ProjectModule { }
