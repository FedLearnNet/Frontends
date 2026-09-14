import {ChangeDetectionStrategy, Component, computed, inject, input, OnInit, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {InfoGridComponent} from '@shared-lib/components/info-grid/info-grid.component';
import {EmptyStateComponent} from '@shared-lib/modules/app-execution/components/empty-state/empty-state.component';
import {SkeletonLoaderComponent} from '@shared-lib/components/skeleton-loader/skeleton-loader.component';
import {RunMessageMetricDTO} from '@shared-lib/modules/experiments/dto/log';
import {RunMetricsRequestService} from '@global-app/project/services/run-metrics-request.service';
import {
  EvaluationMetricComparison,
  EvaluationScalability,
  EvaluationSummaryDto
} from '@global-app/project/dto/run-metrics-request';
import {ProjectFederatedExperimentDetailDTO} from '@global-app/project/dto/project-experiments';
import {
  SimpleMetricLineComponent
} from '../../../../../tool-development/components/app-runs/components/metrics/simple-metric-line/simple-metric-line.component';
import {ValueCardComponent} from "@shared-lib/components/value-card/value-card.component";
import {MatChipListbox, MatChipOption} from "@angular/material/chips";
import {MatTableModule} from "@angular/material/table";

interface EvaluationTableRow {
  site: string;
  ntrain: number | string;
  nval: number | string;
  positiveRate: string;
  local: string;
  federated: string;
}

interface EvaluationTableFooter {
  site: string;
  local: string;
  federated: string;
}

interface EvaluationTableHeaders {
  ntrain: string;
  nval: string;
}


@Component({
  selector: 'app-evaluation-tab',
  imports: [
    CommonModule,
    InfoGridComponent,
    EmptyStateComponent,
    SkeletonLoaderComponent,
    SimpleMetricLineComponent,
    ValueCardComponent,
    MatChipListbox,
    MatChipOption,
    MatTableModule,
  ],
  templateUrl: './evaluation-tab.component.html',
  styleUrl: './evaluation-tab.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EvaluationTabComponent implements OnInit {
  private readonly service = inject(RunMetricsRequestService);
  readonly displayedColumns = ['site', 'ntrain', 'nval', 'positiveRate', 'local', 'federated'];

  projectId = input.required<number>();
  experimentId = input.required<number>();
  experiment = input<ProjectFederatedExperimentDetailDTO | null>(null);

  readonly summary = signal<EvaluationSummaryDto | null>(null);
  readonly isLoading = signal(false);
  readonly selectedMetric = signal<string>('val_auc');

  readonly metricNames = computed<string[]>(() => this.summary()?.metricNames ?? []);

  readonly selected = computed<EvaluationMetricComparison | null>(() =>
    this.summary()?.comparison.find(c => c.metric === this.selectedMetric()) ?? null);

  readonly tableRows = computed<EvaluationTableRow[]>(() =>
    (this.summary()?.sites ?? []).map(site => ({
      site: site.clinicId,
      ntrain: site.ntrain ?? '—',
      nval: site.nval ?? '—',
      positiveRate: this.pct(site.positiveRate),
      local: this.format(site.local?.[this.selectedMetric()] ?? null),
      federated: this.format(site.federated?.[this.selectedMetric()] ?? null),
    })));

  readonly tableHeaders = computed<EvaluationTableHeaders>(() => {
    const securedSuffix = this.summary()?.securedCounts ? '*' : '';
    return {
      ntrain: `n train${securedSuffix}`,
      nval: `n val${securedSuffix}`,
    };
  });

  readonly tableFooter = computed<EvaluationTableFooter>(() => ({
    site: `Weighted mean (${this.selectedMetric()})`,
    local: this.format(this.selected()?.localMean),
    federated: this.format(this.selected()?.federated),
  }));

  readonly convergence = computed<RunMessageMetricDTO[]>(() => {
    const s = this.summary();
    if (!s) return [];
    return s.convergence.map(p => ({
      metric: s.primaryMetric,
      value: p.value.toFixed(4),
      x: '' + p.round,
      xUnit: 'round',
    } as RunMessageMetricDTO));
  });

  readonly scalability = computed<EvaluationScalability | null>(() => this.summary()?.scalability ?? null);

  readonly roundDurations = computed<RunMessageMetricDTO[]>(() =>
    (this.scalability()?.timings ?? [])
      .filter(t => t.roundSeconds != null)
      .map(t => ({
        metric: 'round_seconds',
        value: (t.roundSeconds as number).toFixed(2),
        x: '' + t.round,
        xUnit: 'round',
      } as RunMessageMetricDTO)));

  readonly cumulativeTime = computed<RunMessageMetricDTO[]>(() =>
    (this.scalability()?.timings ?? [])
      .filter(t => t.cumulativeSeconds != null)
      .map(t => ({
        metric: 'cumulative_seconds',
        value: (t.cumulativeSeconds as number).toFixed(2),
        x: '' + t.round,
        xUnit: 'round',
      } as RunMessageMetricDTO)));


  ngOnInit(): void {
    this.load();
  }

  onSelectMetric(name: string): void {
    this.selectedMetric.set(name);
  }

  exportCsv(): void {
    this.service.exportEvaluationCsv(this.projectId(), this.experimentId())
      .subscribe(link => link.click());
  }

  format(v: number | null | undefined): string {
    return v === null || v === undefined || Number.isNaN(v) ? '—' : v.toFixed(4);
  }


  pct(v: number | null | undefined): string {
    return v === null || v === undefined || Number.isNaN(v) ? '—' : (v * 100).toFixed(1) + '%';
  }

  secs(v: number | null | undefined): string {
    if (v === null || v === undefined || Number.isNaN(v)) return '—';
    return ''
  }

  int(v: number | null | undefined): string {
    return v === null || v === undefined || Number.isNaN(v) ? '—' : Math.round(v).toString();
  }

  private load(): void {
    this.isLoading.set(true);
    this.service.getEvaluationSummary(this.projectId(), this.experimentId()).subscribe({
      next: (s) => {
        this.summary.set(s);
        this.selectedMetric.set(s?.primaryMetric ?? s?.metricNames?.[0] ?? 'val_auc');
        this.isLoading.set(false);
      },
      error: () => {
        this.summary.set(null);
        this.isLoading.set(false);
      },
    });
  }
}
