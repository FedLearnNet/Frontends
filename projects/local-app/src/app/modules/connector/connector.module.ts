import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ListConnectorComponent} from "./components/list-connector/list-connector.component";
import {ManageConnectorComponent} from "./components/manage-connector/manage-connector.component";
import {ViewConnectorComponent} from "./components/view-connector/view-connector.component";
import {ConnectorComponent} from "./connector.component";
import {RouterOutlet} from "@angular/router";
import {ConnectorRoutingModule} from "./connector-routing.module";
import {MatToolbarModule} from "@angular/material/toolbar";
import {MatButtonModule} from "@angular/material/button";
import {MatCardModule} from "@angular/material/card";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatInputModule} from "@angular/material/input";
import {MatSelectModule} from "@angular/material/select";
import {MatIconModule} from "@angular/material/icon";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {MatDivider} from "@angular/material/divider";
import {MatCell, MatRow, MatTable, MatTableModule} from "@angular/material/table";
import {MatSidenavModule} from "@angular/material/sidenav";
import {ConnectorStepCardsComponent} from "./components/manage-connector/components/cards/cards.component";
import {ConnectorStepConfigComponent} from "./components/manage-connector/components/config/config.component";
import {
  ConnectorStepDataSourceConfigComponent
} from "./components/manage-connector/components/config/data-source/data-source.component";
import {
  ConnectorStepDataSourceInputFileConfigComponent
} from "./components/manage-connector/components/config/input-file/input-file.component";
import {
  ConnectorStepDataSourceInputFTPConfigComponent
} from "./components/manage-connector/components/config/input-ftp/input-ftp.component";
import {
  ConnectorStepDataSourceInputFunctionConfigComponent
} from "./components/manage-connector/components/config/input-function/input-function.component";
import {MatRadioButton, MatRadioGroup} from "@angular/material/radio";
import {MatSlideToggle} from "@angular/material/slide-toggle";
import {MatTooltipModule} from "@angular/material/tooltip";
import {MatProgressBar} from "@angular/material/progress-bar";
import {MatSnackBarModule} from "@angular/material/snack-bar";
import {
  ConnectorStepSpecifySelectorsComponent
} from "./components/manage-connector/components/config/specify-selectors/specify-selectors.component";
import {
  ConnectorDynamicTableComponent
} from "./components/manage-connector/components/table/dynamic-table/dynamic-table.component";
import {CdkDrag, CdkDropList, CdkDropListGroup} from "@angular/cdk/drag-drop";
import {
  ConnectorEditMapperComponent
} from "./components/manage-connector/components/mapper/edit-mapper/edit-mapper.component";
import {MatButtonToggleModule} from "@angular/material/button-toggle";
import {MatTabsModule} from "@angular/material/tabs";
import {
  ConnectorPreviewMapperComponent
} from "./components/manage-connector/components/mapper/preview-mapper/preview-mapper.component";
import {MatPaginatorModule} from "@angular/material/paginator";
import {MatMenuModule} from "@angular/material/menu";
import {SharedLibModule} from "@shared-lib/shared-lib.module";
import {RunConnectorViewComponent} from "./components/run-connector/run-connector.component";
import {RunConnectorLogComponent} from "./components/run-connector/components/run-log/run-log.component";
import {MatSortModule} from "@angular/material/sort";
import {
  RunConnectorChangeLogComponent
} from "./components/run-connector/components/run-change-log/run-change-log.component";

@NgModule({
  declarations: [
    ConnectorStepDataSourceConfigComponent,
    ConnectorStepDataSourceInputFileConfigComponent,
    ConnectorStepDataSourceInputFTPConfigComponent,
    ConnectorStepDataSourceInputFunctionConfigComponent,
    ConnectorStepSpecifySelectorsComponent,
    ConnectorStepCardsComponent,
    ConnectorStepConfigComponent,
    ConnectorDynamicTableComponent,
    ConnectorComponent,
    RunConnectorViewComponent,
    ConnectorEditMapperComponent,
    ConnectorPreviewMapperComponent,
    ListConnectorComponent,
    ManageConnectorComponent,
    RunConnectorLogComponent,
    ViewConnectorComponent,
    RunConnectorChangeLogComponent
  ],
  imports: [
    CommonModule,
    ConnectorRoutingModule,
    RouterOutlet,
    MatToolbarModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSortModule,
    MatIconModule,
    FormsModule,
    ReactiveFormsModule,
    MatDivider,
    MatTable,
    MatRow,
    MatCell,
    MatSidenavModule,
    MatRadioGroup,
    MatRadioButton,
    MatPaginatorModule,
    MatSlideToggle,
    MatMenuModule,
    MatTooltipModule,
    MatProgressBar,
    MatButtonToggleModule,
    MatTabsModule,
    MatSnackBarModule,
    MatTableModule,
    CdkDropListGroup,
    CdkDropList,
    CdkDrag,
    SharedLibModule
  ]
})
export class ConnectorModule {
}
