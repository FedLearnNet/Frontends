import {ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, input, OnInit} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {AppLogTableComponent} from "../../app-runs/components/app-log-table/app-log-table.component";
import {EMPTY, Observable} from "rxjs";
import {RunMessageMetricDTO} from "@shared-lib/modules/experiments/dto/log";
import {AppDetailDto} from "@shared-lib/modules/store/dto/app-detail";
import {AsyncPipe} from "@angular/common";
import {
  SimpleMetricLineComponent
} from "../../app-runs/components/metrics/simple-metric-line/simple-metric-line.component";
import {MatTabsModule} from "@angular/material/tabs";
import {ExperimentHeaderComponent} from "../experiment-header/experiment-header.component";
import {ModelSubDto} from "@shared-lib/modules/app-execution/dto/model";
import {ModelService} from "@global-app/model-store/services/model.service";
import {
  AppRunOutputComponent
} from "@shared-lib/modules/app-execution/components/app-run-output/app-run-output.component";
import {RunType} from "../../../dto/socket";
import {TestAttemptDTO, TestRunDTO, trialsOf} from "../../../dto/test-run";
import {SkeletonLoaderComponent} from "@shared-lib/components/skeleton-loader/skeleton-loader.component";
import {
  RunHyperParamsComponent
} from "@shared-lib/modules/experiments/components/run-hyper-params/run-hyper-params.component";
import {RunPerformanceComponent} from "@shared-lib/components/run-performance/run-performance.component";
import {
  ModelVersionSubDetailComponent
} from "@global-app/model-store/components/model-version-sub-detail/model-version-sub-detail.component";

@Component({
  selector: 'app-experiment-run-detail',
  imports: [
    AppLogTableComponent,
    AsyncPipe,
    SimpleMetricLineComponent,
    MatTabsModule,
    ExperimentHeaderComponent,
    AppRunOutputComponent,
    SkeletonLoaderComponent,
    RunHyperParamsComponent,
    RunPerformanceComponent,
    ModelVersionSubDetailComponent
  ],
  templateUrl: './experiment-run-detail.component.html',
  styleUrl: './experiment-run-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExperimentRunDetailComponent implements OnInit {
  private readonly activatedRoute: ActivatedRoute = inject(ActivatedRoute);
  private readonly cdr: ChangeDetectorRef = inject(ChangeDetectorRef);
  private readonly modelSubService: ModelService = inject(ModelService);

  // The attempt id of the trial.
  readonly runId = input<string>();

  public app?: AppDetailDto;
  public experiment?: TestRunDTO;
  public run?: TestAttemptDTO;

  public metrics: Map<string, RunMessageMetricDTO[]> = new Map<string, RunMessageMetricDTO[]>();
  public model$: Observable<ModelSubDto> = EMPTY;

  // The resolved experiment carries the logs and metrics of every trial.
  ngOnInit(): void {
    this.activatedRoute.data.subscribe((data) => {
      this.experiment = data["experiment"];
      this.app = data["app"];
      const runId = this.runId();
      if (this.experiment && runId) {
        this.run = trialsOf(this.experiment).find(attempt => attempt.id === +runId);
      }
      if (this.run) {
        this.model$ = this.modelSubService.getSubModelForExperimentRun(this.run.id);
        this.metrics = (this.run.metrics ?? []).reduce((acc, metric) => {
          if (!acc.has(metric.metric)) {
            acc.set(metric.metric, []);
          }
          acc.get(metric.metric)!.push(metric);
          return acc;
        }, new Map<string, RunMessageMetricDTO[]>());
      }
      this.cdr.detectChanges();
    });
  }

  getRunType(): RunType {
    return RunType.EXPERIMENT_RUN;
  }

  getMetrics(metric: string): RunMessageMetricDTO[] {
    return this.metrics.get(metric) || [];
  }

  getMetricsNames(): string[] {
    return Array.from(this.metrics.keys());
  }
}
