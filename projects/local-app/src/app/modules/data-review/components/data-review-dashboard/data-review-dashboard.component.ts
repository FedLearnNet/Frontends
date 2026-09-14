import {Component} from '@angular/core';
import {TrainingGridComponent} from "@local-app/data-review/components/training-grid/training-grid.component";
import {PermissionGridComponent} from "@local-app/data-review/components/permission-grid/permission-grid.component";
import {StatisticsGridComponent} from "@local-app/data-review/components/statistics-grid/statistics-grid.component";
import {MetricsGridComponent} from "@local-app/data-review/components/metrics-grid/metrics-grid.component";
import {HeaderComponent} from "@shared-lib/components/header/header.component";

@Component({
  selector: 'app-data-review-dashboard',
  templateUrl: './data-review-dashboard.component.html',
  styleUrl: './data-review-dashboard.component.scss',
  imports: [
    TrainingGridComponent,
    PermissionGridComponent,
    StatisticsGridComponent,
    MetricsGridComponent,
    HeaderComponent,
  ]
})
export class DataReviewDashboardComponent {

}
