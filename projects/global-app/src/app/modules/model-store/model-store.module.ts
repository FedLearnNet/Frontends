import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModelStoreRoutingModule } from '@global-app/model-store/model-store-routing.module';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatDialogModule } from '@angular/material/dialog';
import { ModelStoreComponent } from '@global-app/model-store/model-store.component';
import { ModelStoreDashboardComponent } from '@global-app/model-store/components/dashboard/dashboard.component';
import { FilterComponent } from '@global-app/model-store/components/filter/filter.component';
import { StoreComponent } from '@global-app/model-store/components/store/store.component';
import { ModelDetailComponent } from '@global-app/model-store/components/store/components/model-detail/model-detail.component';
import { PredictionGridComponent } from '@global-app/model-store/components/prediction-grid/prediction-grid.component';
import { PredictionResultDetailComponent } from '@global-app/model-store/components/prediction-grid/components/prediction-result-detail/prediction-result-detail.component';
import { SharedLibModule } from '@shared-lib/shared-lib.module';

@NgModule({
  declarations: [
    ModelStoreComponent,
    ModelStoreDashboardComponent,
    FilterComponent,
    StoreComponent,
    ModelDetailComponent,
    PredictionGridComponent,
    PredictionResultDetailComponent,
  ],
  imports: [
    CommonModule,
    ModelStoreRoutingModule,
    MatCardModule,
    MatDividerModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatGridListModule,
    MatCardModule,
    MatTabsModule,
    ReactiveFormsModule,
    MatTableModule,
    MatDialogModule,
    SharedLibModule,
  ],
  providers: [],
})
export class ModelStoreModule { }
