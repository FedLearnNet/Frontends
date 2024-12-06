import {ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, Input, OnInit} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {ExperimentService} from "../../../service/experiment-run.service";
import {ExperimentDetailDTO, ExperimentRunDTO} from "../../../dto/experiment";
import {AppLogTableComponent} from "../../app-runs/components/app-log-table/app-log-table.component";
import {EMPTY, Observable} from "rxjs";
import {RunMessageLogDTO, RunMessageMetricDTO} from "../../../dto/log";
import {AppDetailDto} from "@global-app/app-store/dto/app-detail";
import {AsyncPipe, JsonPipe} from "@angular/common";
import {
  MatAccordion,
} from "@angular/material/expansion";
import {
  SimpleMetricLineComponent
} from "../../app-runs/components/metrics/simple-metric-line/simple-metric-line.component";
import {MatTabsModule} from "@angular/material/tabs";
import {ExperimentHeaderComponent} from "../experiment-header/experiment-header.component";
import {SharedLibModule} from "@shared-lib/shared-lib.module";
import {ModelSubDto} from "@global-app/model-store/dto/model";
import {ModelService} from "@global-app/model-store/services/model.service";

@Component({
  selector: 'app-experiment-run-detail',
  standalone: true,
    imports: [
        AppLogTableComponent,
        AsyncPipe,
        SimpleMetricLineComponent,
        MatTabsModule,
        ExperimentHeaderComponent,
        SharedLibModule,
        JsonPipe
    ],
  templateUrl: './experiment-run-detail.component.html',
  styleUrl: './experiment-run-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExperimentRunDetailComponent implements OnInit {
  private readonly activatedRoute: ActivatedRoute = inject(ActivatedRoute);
  private readonly experimentService: ExperimentService = inject(ExperimentService);
  private readonly cdr: ChangeDetectorRef = inject(ChangeDetectorRef);
  private readonly modelSubService: ModelService = inject(ModelService);

  @Input() runId?: string;

  public app?: AppDetailDto;
  public experiment?: ExperimentDetailDTO;
  public run?: ExperimentRunDTO;

  public logs$: Observable<RunMessageLogDTO[]> = EMPTY;
  public metrics: Map<string, RunMessageMetricDTO[]> = new Map<string, RunMessageMetricDTO[]>();
  public model$: Observable<ModelSubDto> = EMPTY;

  ngOnInit(): void {

    this.activatedRoute.data.subscribe((data) => {
      this.experiment = data["experiment"];
      this.app = data["app"];
      if (this.experiment && this.runId) {
        this.run = this.experiment.runs.find(run => run.id === +this.runId!);
      }

      if (this.run && this.app) {
        this.model$ = this.modelSubService.getSubModelForExperimentRun(+this.runId!);
        this.logs$ = this.experimentService.getLogs(this.app.id, this.experiment!.id, +this.runId!);
        this.experimentService.getMetricsByRun(this.app.id, this.experiment!.id, +this.runId!).subscribe(
          (metrics) => {
            this.metrics = metrics.reduce((acc, metric) => {
              if (!acc.has(metric.metric)) {
                acc.set(metric.metric, []);
              }
              acc.get(metric.metric)!.push(metric);
              return acc;
            }, new Map<string, RunMessageMetricDTO[]>());
            this.cdr.detectChanges();
          }
        )
      }

      this.cdr.detectChanges();
    });
  }

  getHyperParamNames(): string[] {
    return Object.keys(this.run!.hyperParams);
  }

  getOutputNames(): string[] {
    return Object.keys(this.run!.outputData);
  }

  getMetrics(metric: string): RunMessageMetricDTO[] {
    return this.metrics.get(metric) || [];
  }

  getMetricsNames(): string[] {
    return Array.from(this.metrics.keys());
  }
}
