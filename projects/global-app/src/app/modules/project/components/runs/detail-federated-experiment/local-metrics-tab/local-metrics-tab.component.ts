import {ChangeDetectionStrategy, Component, computed, inject, input, OnInit, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MatButtonModule} from '@angular/material/button';
import {MatDialog} from '@angular/material/dialog';
import {MatIconModule} from '@angular/material/icon';
import {MatTabsModule} from '@angular/material/tabs';
import {BadgeComponent} from '@shared-lib/components/badge/badge.component';
import {EmptyStateComponent} from '@shared-lib/modules/app-execution/components/empty-state/empty-state.component';
import {TimeBadgeComponent} from '@shared-lib/components/time-badge/time-badge.component';
import {InfoGridComponent} from '@shared-lib/components/info-grid/info-grid.component';
import {InfoItemComponent} from '@shared-lib/components/info-item/info-item.component';
import {SkeletonLoaderComponent} from '@shared-lib/components/skeleton-loader/skeleton-loader.component';
import {RunMessageMetricDTO} from '@shared-lib/modules/experiments/dto/log';
import {
  RunMetricsRequestDto,
  RunMetricsRequestStatus,
  RunMetricsResponseDto
} from '@global-app/project/dto/run-metrics-request';
import {RunMetricsRequestService} from '@global-app/project/services/run-metrics-request.service';
import {
  RequestLocalMetricsDialogComponent
} from '@global-app/project/components/runs/request-local-metrics-dialog/request-local-metrics-dialog.component';
import {
  ClinicMetricsDialogComponent,
  ClinicMetricsDialogData
} from './clinic-metrics-dialog/clinic-metrics-dialog.component';
import {
  SimpleMetricLineComponent
} from "../../../../../tool-development/components/app-runs/components/metrics/simple-metric-line/simple-metric-line.component";
import {PageWrapperComponent} from "@shared-lib/components/page-wrapper/page-wrapper.component";

interface ClinicMetricSummary {
  clinicId: string;
  metricNames: string[];
  metrics: RunMessageMetricDTO[];
}

@Component({
  selector: 'app-local-metrics-tab',
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    BadgeComponent,
    EmptyStateComponent,
    TimeBadgeComponent,
    InfoGridComponent,
    InfoItemComponent,
    SkeletonLoaderComponent,
    SimpleMetricLineComponent,
    PageWrapperComponent,
  ],
  templateUrl: './local-metrics-tab.component.html',
  styleUrl: './local-metrics-tab.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LocalMetricsTabComponent implements OnInit {
  private readonly service = inject(RunMetricsRequestService);
  private readonly dialog = inject(MatDialog);

  projectId = input.required<number>();
  experimentId = input.required<number>();

  readonly request = signal<RunMetricsRequestDto | null>(null);
  readonly responses = signal<RunMetricsResponseDto[]>([]);
  readonly isLoadingRequest = signal(false);
  readonly isRequesting = signal(false);
  readonly viewMode = signal<'per-clinic' | 'aggregated'>('per-clinic');

  readonly clinicSummaries = computed<ClinicMetricSummary[]>(() =>
    this.responses().map(r => ({
      clinicId: r.randomClinicId,
      metricNames: [...new Set(r.metrics?.map(m => m.metric) ?? [])],
      metrics: r.metrics ?? [],
    }))
  );

  readonly aggregatedMetricNames = computed<string[]>(() => {
    const names = new Set<string>();
    for (const r of this.responses()) {
      for (const m of r.metrics ?? []) {
        names.add(m.metric);
      }
    }
    return [...names];
  });

  readonly acceptedCount = computed(() => this.responses().length);

  protected readonly RunMetricsRequestStatus = RunMetricsRequestStatus;

  ngOnInit(): void {
    this.loadRequest();
  }

  openRequestDialog(): void {
    this.dialog.open(RequestLocalMetricsDialogComponent, {
      height: '80vh',
      width: '90vw',
      maxWidth: '90vw',
      autoFocus: false,
      data: {experimentId: this.experimentId(), projectId: this.projectId()},
    }).afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) this.createRequest();
    });
  }

  openClinicDialog(summary: ClinicMetricSummary): void {
    this.dialog.open<ClinicMetricsDialogComponent, ClinicMetricsDialogData>(
      ClinicMetricsDialogComponent,
      {
        width: '720px',
        data: {clinicId: summary.clinicId, metrics: summary.metrics},
      }
    );
  }

  /** Names of all metrics present across all clinic responses (for aggregated tab). */
  getMetricsNames(): string[] {
    return this.aggregatedMetricNames();
  }

  /** Average-value series for a given metric name, formatted as RunMessageMetricDTO for the chart. */
  getMetrics(name: string): RunMessageMetricDTO[] {
    const xMap = new Map<string, number[]>();
    let xUnit = '';

    for (const r of this.responses()) {
      for (const m of r.metrics ?? []) {
        if (m.metric !== name) continue;
        const bucket = xMap.get(m.x) ?? [];
        bucket.push(parseFloat(m.value));
        xMap.set(m.x, bucket);
        xUnit = m.xUnit;
      }
    }

    return Array.from(xMap.entries())
      .sort((a, b) => parseFloat(a[0]) - parseFloat(b[0]))
      .map(([x, vals]) => {
        const avg = vals.reduce((s, v) => s + v, 0) / vals.length;
        return {metric: name, value: avg.toFixed(4), x, xUnit} as RunMessageMetricDTO;
      });
  }

  getStatusBadgeType(status: RunMetricsRequestStatus) {
    switch (status) {
      case RunMetricsRequestStatus.COMPLETED:
      case RunMetricsRequestStatus.APPROVED:
        return 'SUCCESS';
      case RunMetricsRequestStatus.REJECTED:
        return 'FAILED';
      case RunMetricsRequestStatus.RUNNING:
        return 'RUNNING';
      default:
        return 'PENDING';
    }
  }

  refreshResponses(): void {
    this.loadRequest();
  }

  private loadRequest(): void {
    this.isLoadingRequest.set(true);
    this.service.getRequest(this.projectId(), this.experimentId()).subscribe({
      next: (req) => {
        this.request.set(req);
        this.responses.set(req?.responses ?? []);
        this.isLoadingRequest.set(false);
      },
      error: () => this.isLoadingRequest.set(false),
    });
  }

  private createRequest(): void {
    this.isRequesting.set(true);
    this.service.createRequest(this.projectId(), this.experimentId()).subscribe({
      next: (req) => {
        this.request.set(req);
        this.isRequesting.set(false);
      },
      error: () => this.isRequesting.set(false),
    });
  }

}
