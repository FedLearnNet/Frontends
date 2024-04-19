import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatStepperModule } from '@angular/material/stepper';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import { MatDividerModule } from '@angular/material/divider';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { FindDataDashboardComponent } from '@global-app/find-data/components/dashboard/dashboard.component';
import { FindDataComponent } from '@global-app/find-data/find-data.component';
import { FindDataRoutingModule } from '@global-app/find-data/find-data-routing.module';
import { WorkflowDashboardComponent } from '@global-app/find-data/components/workflow-dashboard/workflow-dashboard.component';
import { WorkflowDetailComponent } from '@global-app/find-data/components/workflow-dashboard/components/workflow-detail/workflow-detail.component';
import { QueryDetailComponent } from '@global-app/find-data/components/query-detail/query-detail.component';
import { QueryBuilderItemComponent } from '@global-app/find-data/components/query-detail/components/query-builder-item/query-builder-item.component';
import { ApplicationGridComponent } from '@global-app/find-data/components/workflow-dashboard/components/workflow-detail/components/application-grid/application-grid.component';

@NgModule({
  declarations: [
    FindDataComponent,
    FindDataDashboardComponent,
    WorkflowDashboardComponent,
    QueryDetailComponent,
    QueryBuilderItemComponent,
    WorkflowDetailComponent,
    ApplicationGridComponent,
  ],
  imports: [
    CommonModule,
    FindDataRoutingModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatStepperModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatDialogModule,
    MatSelectModule,
    MatDividerModule,
    DragDropModule,
    MatGridListModule,
    MatCardModule,
    MatTooltipModule,
    MatMenuModule,
  ],
  providers: [],
})
export class FindDataModule {}
