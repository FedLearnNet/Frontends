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
import {takeUntilDestroyed, toSignal} from '@angular/core/rxjs-interop';
import {auditTime, filter, switchMap} from 'rxjs';

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
import {ExperimentRunsChartsComponent} from '../experiment-runs-charts/experiment-runs-charts.component';
import {ExperimentHeaderComponent} from '../experiment-header/experiment-header.component';
import {ExperimentDiagramConfigDTO} from '../../../dto/config';
import {ExperimentRunCircleComponent} from '../experiment-run-circle/experiment-run-circle.component';
import {ModelVersionDto} from '@shared-lib/modules/app-execution/dto/model';
import {ModelService} from '@global-app/model-store/services/model.service';
import {ExecutionExperimentDTO, TestAttemptDTO, TestRunDTO, trialColorOf, trialNameOf, trialsOf} from '../../../dto/test-run';
import {ControllerSocketService} from '../../../service/testembed-socket.service';
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
  private readonly socketService = inject(ControllerSocketService);
  private readonly modelService = inject(ModelService);
  private readonly destroyRef = inject(DestroyRef);

  private readonly paginator = viewChild<MatPaginator>('paginator');

  readonly displayedColumns: string[] = ['select', 'element', 'actions'];
  readonly runDataSource = new MatTableDataSource<TestAttemptDTO>();
  readonly runSelection = new SelectionModel<TestAttemptDTO>(true, []);

  private readonly routeData = toSignal(this.route.data, {initialValue: {} as any});

  readonly app = computed<AppDetailDto | undefined>(() => this.routeData()?.['app']);
  // The experiment with the logs and metrics of its trials.
  readonly experiment = signal<TestRunDTO | undefined>(undefined);

  readonly modelVersion = signal<ModelVersionDto | undefined>(undefined);

  readonly runs = computed<TestAttemptDTO[]>(() => {
    const exp = this.experiment();
    return exp ? trialsOf(exp) : [];
  });

  constructor() {
    effect(() => {
      const exp = this.routeData()?.['experiment'] as TestRunDTO | undefined;
      this.experiment.set(exp);
    });

    effect(() => {
      const exp = this.experiment();
      if (!exp) {
        this.modelVersion.set(undefined);
        return;
      }
      const sub = this.modelService
        .getModelVersionForExperiment(exp.experimentId!)
        .subscribe((model) => this.modelVersion.set(model));
      this.destroyRef.onDestroy(() => sub.unsubscribe());
    });

    // Updates leave the messages out, so the detail is read again, at most every few seconds.
    this.socketService.getExperimentUpdate$()
      .pipe(
        filter(update => update.experimentId === this.experiment()?.experimentId),
        auditTime(3000),
        switchMap(update => this.experimentService.getExperiment(this.app()?.id ?? null, update.experimentId ?? null)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(exp => this.experiment.set(exp));

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

  checkboxLabel(row?: TestAttemptDTO): string {
    if (!row) return `${this.isAllSelected() ? 'deselect' : 'select'} all`;
    return `${this.runSelection.isSelected(row) ? 'deselect' : 'select'} row ${row.id}`;
  }

  hyperParamToDataSource(hyperParams: object | null | undefined): { key: string; value: any }[] {
    return Object.entries(hyperParams || {}).map(([key, value]) => ({key, value}));
  }

  diagramsChanged(diagrams: ExperimentDiagramConfigDTO[]): void {
    const exp = this.experiment();
    const app = this.app();
    if (!exp?.experiment || !app?.id) {
      console.error('Experiment or app not found');
      return;
    }
    const updated: ExecutionExperimentDTO = {...exp.experiment, diagramConfigs: diagrams};
    this.experiment.set({...exp, experiment: updated});
    this.experimentService.updateExperiment(app.id, updated).subscribe({
      error: (e) => console.error(e),
    });
  }

  protected readonly runStatusToBadgeStatus = runStatusToBadgeStatus;
  protected readonly trialNameOf = trialNameOf;
  protected readonly trialColorOf = trialColorOf;
}
