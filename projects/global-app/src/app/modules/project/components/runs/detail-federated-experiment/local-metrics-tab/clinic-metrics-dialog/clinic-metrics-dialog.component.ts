import {ChangeDetectionStrategy, Component, inject} from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogTitle
} from '@angular/material/dialog';
import {MatButtonModule} from '@angular/material/button';
import {BadgeComponent} from '@shared-lib/components/badge/badge.component';
import {RunMessageMetricDTO} from '@shared-lib/modules/experiments/dto/log';
import {
  SimpleMetricLineComponent
} from "../../../../../../tool-development/components/app-runs/components/metrics/simple-metric-line/simple-metric-line.component";
import {EmptyStateComponent} from "@shared-lib/modules/app-execution/components/empty-state/empty-state.component";

export interface ClinicMetricsDialogData {
  clinicId: string;
  metrics: RunMessageMetricDTO[];
}

@Component({
  selector: 'app-clinic-metrics-dialog',
  imports: [
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatDialogClose,
    MatButtonModule,
    BadgeComponent,
    SimpleMetricLineComponent,
    EmptyStateComponent,
  ],
  templateUrl: './clinic-metrics-dialog.component.html',
  styleUrl: './clinic-metrics-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClinicMetricsDialogComponent {
  readonly data = inject<ClinicMetricsDialogData>(MAT_DIALOG_DATA);

  getMetricNames(): string[] {
    return [...new Set(this.data.metrics.map(m => m.metric))];
  }

  getMetrics(name: string): RunMessageMetricDTO[] {
    return this.data.metrics.filter(m => m.metric === name);
  }
}
