import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { PermissionService } from '@local-app/data-review/services/permission.service';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatMenuModule } from '@angular/material/menu';
import { PermissionDetailComponent } from '@local-app/data-review/components/permission-detail/permission-detail.component';
import { PermissionGridComponent } from '@local-app/data-review/components/permission-grid/permission-grid.component';
import { DataReviewDashboardComponent } from '@local-app/data-review/components/data-review-dashboard/data-review-dashboard.component';
import { DataReviewComponent } from '@local-app/data-review/data-review.component';
import { DataReviewRoutingModule } from '@local-app/data-review/data-review-routing.module';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTreeModule } from '@angular/material/tree';
import { ScrollingModule } from '@angular/cdk/scrolling';
import {TrainingGridComponent} from "@local-app/data-review/components/training-grid/training-grid.component";

@NgModule({
    declarations: [
        DataReviewComponent,
        DataReviewDashboardComponent,
        PermissionGridComponent,
        PermissionDetailComponent,
    ],
  imports: [
    CommonModule,
    DataReviewRoutingModule,
    MatTableModule,
    MatButtonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatDialogModule,
    MatSelectModule,
    MatDividerModule,
    MatIconModule,
    MatSlideToggleModule,
    MatMenuModule,
    MatCheckboxModule,
    MatTreeModule,
    ScrollingModule,
    TrainingGridComponent,
  ],
    providers: [
        PermissionService,
    ],
})
export class DataReviewModule {}
