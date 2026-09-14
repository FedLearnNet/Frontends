import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  effect,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import {ActivatedRoute, RouterLink} from '@angular/router';
import {toSignal} from '@angular/core/rxjs-interop';

import {MatListModule} from '@angular/material/list';
import {MatIconModule} from '@angular/material/icon';
import {MatDividerModule} from '@angular/material/divider';
import {MatTableDataSource, MatTableModule} from '@angular/material/table';
import {SelectionModel} from '@angular/cdk/collections';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatSortModule} from '@angular/material/sort';
import {MatPaginator, MatPaginatorModule} from '@angular/material/paginator';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatButtonModule} from '@angular/material/button';

import {TranslatePipe} from '@ngx-translate/core';

import {AppDetailDto} from '@shared-lib/modules/store/dto/app-detail';
import {ExperimentService} from '../../../service/experiment-run.service';
import {RunMessageMetricDTO, RunMessageTypes} from '@shared-lib/modules/experiments/dto/log';
import {ExperimentRunsChartsComponent} from '../experiment-runs-charts/experiment-runs-charts.component';
import {ExperimentHeaderComponent} from '../experiment-header/experiment-header.component';
import {ExperimentDiagramConfigDTO} from '../../../dto/config';
import {ExperimentRunCircleComponent} from '../experiment-run-circle/experiment-run-circle.component';
import {ModelVersionDto} from '@shared-lib/modules/app-execution/dto/model';
import {ModelService} from '@global-app/model-store/services/model.service';
import {ExperimentDetailDTO, ExperimentRunDTO} from '@shared-lib/modules/app-execution/dto/experiment';
import {RunStatusTypes} from '../../../dto/test-run';
import {StatusBadgeComponent} from '@shared-lib/components/status-badge/status-badge.component';
import {runStatusToBadgeStatus} from '@shared-lib/utils/badge-status.helper';

@Component({
  selector: 'app-experiment-detail',
  standalone: true,
  imports: [
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatExpansionModule,
    MatDividerModule,
    MatTableModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatInputModule,
    MatSortModule,
    MatPaginatorModule,
    ExperimentRunsChartsComponent,
    RouterLink,
    ExperimentHeaderComponent,
    ExperimentRunCircleComponent,
    TranslatePipe,
    StatusBadgeComponent,
  ],
  templateUrl: './experiment-detail.component.html',
  styleUrl: './experiment-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExperimentDetailComponent implements AfterViewInit {
  private readonly route = inject(ActivatedRoute);
  private readonly experimentService = inject(ExperimentService);
  private readonly modelService = inject(ModelService);
  private readonly destroyRef = inject(DestroyRef);

  private readonly paginator = viewChild<MatPaginator>('paginator');

  readonly displayedColumns: string[] = ['select', 'element', 'actions'];
  readonly runDataSource = new MatTableDataSource<ExperimentRunDTO>();
  readonly runSelection = new SelectionModel<ExperimentRunDTO>(true, []);

  private readonly routeData = toSignal(this.route.data, {initialValue: {} as any});

  readonly app = computed<AppDetailDto | undefined>(() => this.routeData()?.['app']);
  readonly experiment = signal<ExperimentDetailDTO | undefined>(undefined);

  readonly experimentRuns = signal<ExperimentRunDTO[]>(
    Array.from({length: 20}, (_, i) => this.createExperimentRun(i + 1)),
  );

  readonly modelVersion = signal<ModelVersionDto | undefined>(undefined);
  readonly metrics = signal<RunMessageMetricDTO[]>([]);

  readonly runs = computed<ExperimentRunDTO[]>(() => {
    const exp = this.experiment();
    if (!exp) return [];
    const baseRuns = (exp.runs?.length ? exp.runs : this.experimentRuns()) ?? [];
    const ms = this.metrics();
    if (!ms.length) return baseRuns;
    return baseRuns.map((run) => ({
      ...run,
      metrics: ms.filter((m) => m.runId === run.id),
    }));
  });

  constructor() {
    effect(() => {
      const exp = this.routeData()?.['experiment'] as ExperimentDetailDTO | undefined;
      this.experiment.set(exp);
    });

    effect(() => {
      const exp = this.experiment();
      if (!exp) {
        this.modelVersion.set(undefined);
        return;
      }
      const sub = this.modelService
        .getModelVersionForExperiment(exp.id)
        .subscribe((model) => this.modelVersion.set(model));
      this.destroyRef.onDestroy(() => sub.unsubscribe());
    });

    effect(() => {
      const app = this.app();
      const exp = this.experiment();
      if (!app?.id || !exp?.id) {
        this.metrics.set([]);
        return;
      }
      const sub = this.experimentService
        .getMetrics(app.id, exp.id)
        .subscribe((m) => this.metrics.set(m));
      this.destroyRef.onDestroy(() => sub.unsubscribe());
    });

    effect(() => {
      const runs = this.runs();
      this.runDataSource.data = runs;
      this.runSelection.clear();
      if (runs.length) this.runSelection.select(...runs);
    });
  }

  ngAfterViewInit(): void {
    this.runDataSource.paginator = this.paginator();
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value ?? '';
    this.runDataSource.filter = filterValue.trim().toLowerCase();
    this.runDataSource.paginator?.firstPage();
  }

  isAllSelected(): boolean {
    const numSelected = this.runSelection.selected.length;
    const numRows = this.runDataSource.data.length;
    return numSelected === numRows;
  }

  toggleAllRows(): void {
    if (this.isAllSelected()) {
      this.runSelection.clear();
      return;
    }
    this.runSelection.select(...this.runDataSource.data);
  }

  checkboxLabel(row?: ExperimentRunDTO): string {
    if (!row) return `${this.isAllSelected() ? 'deselect' : 'select'} all`;
    return `${this.runSelection.isSelected(row) ? 'deselect' : 'select'} row ${row.id}`;
  }

  hyperParamToDataSource(hyperParams: object): { key: string; value: any }[] {
    return Object.entries(hyperParams || {}).map(([key, value]) => ({key, value}));
  }

  diagramsChanged(diagrams: ExperimentDiagramConfigDTO[]): void {
    const exp = this.experiment();
    const app = this.app();
    if (!exp || !app?.id) {
      console.error('Experiment or app not found');
      return;
    }
    const updated: ExperimentDetailDTO = {...exp, diagramConfigs: diagrams};
    this.experiment.set(updated);
    this.experimentService.updateExperiment(app.id, updated).subscribe({
      error: (e) => console.error(e),
    });
  }

  createRandomMetric(metricName: string, runId: number): RunMessageMetricDTO {
    return {
      id: Math.floor(Math.random() * 1000),
      version: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      process: 'process_name',
      message: 'Metric generated',
      type: RunMessageTypes.METRIC,
      runId,
      metric: metricName,
      value: (this.randomIntFromInterval(0, 100) / 100).toFixed(2),
      x: (Math.random() * 10).toFixed(2),
      xUnit: 'seconds',
    };
  }

  randomIntFromInterval(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

  createExperimentRun(id: number): ExperimentRunDTO {
    const runId = id;
    return {
      id: runId,
      version: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      status: RunStatusTypes.FINISHED,
      error: '',
      name: `Run_${runId}`,
      color: this.generateRandomColor(),
      outputData: {
        output1: 'output1',
        output2: 'output2',
        output3: 'output3',
        output4: 'output4',
      },
      hyperParams: {
        alpha: Math.random().toFixed(2),
        lambda: Math.random().toFixed(2),
        max_depth: Math.floor(Math.random() * 10).toString(),
      },
      metrics: [
        ...Array.from({length: 10}, () => this.createRandomMetric('rmse', runId)),
        ...Array.from({length: 10}, () => this.createRandomMetric('acc', runId)),
      ],
      experimentId: Math.floor(Math.random() * 100),
    };
  }

  generateRandomColor(): string {
    const randomInt = Math.floor(Math.random() * 0xffffff);
    return `#${randomInt.toString(16).padStart(6, '0')}`;
  }

  protected readonly runStatusToBadgeStatus = runStatusToBadgeStatus;
}
