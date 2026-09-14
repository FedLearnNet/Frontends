import {Component, computed, input} from '@angular/core';
import {RunMessageMetricDTO} from "@shared-lib/modules/experiments/dto/log";
import {
  MatAccordion,
  MatExpansionPanel, MatExpansionPanelContent,
  MatExpansionPanelHeader,
  MatExpansionPanelTitle
} from "@angular/material/expansion";
import {
  RunHyperParamsComponent
} from "@shared-lib/modules/experiments/components/run-hyper-params/run-hyper-params.component";
import {RunLogsListComponent} from "@shared-lib/modules/experiments/components/run-logs-list/run-logs-list.component";
import {
  SimpleMetricLineComponent
} from "../../../../../../../global-app/src/app/modules/tool-development/components/app-runs/components/metrics/simple-metric-line/simple-metric-line.component";
import {TranslatePipe} from "@ngx-translate/core";
import {RunStatusTypes} from "../../../../../../../global-app/src/app/modules/tool-development/dto/test-run";
import {runStatusToBadgeStatus} from "@shared-lib/utils/badge-status.helper";
import {ErrorCardComponent} from "@shared-lib/components/error-card/error-card.component";
import {
  ExperimentStepDataComponent
} from "@shared-lib/modules/experiments/components/experiment-step-data/experiment-step-data.component";
import {ExperimentData} from "@shared-lib/modules/experiments/models/experiment-data";
import {ToolConfigsDTO} from "@shared-lib/modules/app-execution/dto/config";

@Component({
  selector: 'lib-experiment-workflow-node-detail',
  imports: [
    MatAccordion,
    MatExpansionPanel,
    MatExpansionPanelHeader,
    MatExpansionPanelTitle,
    RunHyperParamsComponent,
    RunLogsListComponent,
    SimpleMetricLineComponent,
    TranslatePipe,
    ErrorCardComponent,
    ExperimentStepDataComponent,
    MatExpansionPanelContent
  ],
  templateUrl: './experiment-workflow-node-detail.component.html',
  styleUrl: './experiment-workflow-node-detail.component.scss'
})
export class ExperimentWorkflowNodeDetailComponent {
  experimentData = input.required<ExperimentData>();
  config = input<ToolConfigsDTO>();

  hideInput = input<boolean>(false);
  hideOutput = input<boolean>(false);
  hideMetric = input<boolean>(false);
  hideLogs = input<boolean>(false);

  /** Controller-traffic logs (group=CONTROLLER) are hidden by default; pass false for nodes whose
   *  tool supports federated learning to expose them. */
  hideController = input<boolean>(true);

  controllerLogs = computed(() =>
    (this.experimentData().logs ?? []).filter(log => log.group === 'CONTROLLER'));

  appLogs = computed(() =>
    (this.experimentData().logs ?? []).filter(log => log.group !== 'CONTROLLER'));

  metricsReduced = computed(() => {
    const metrics = this.experimentData().metric ?? [];
    return metrics.reduce((acc, metric) => {
      if (!acc.has(metric.metric)) {
        acc.set(metric.metric, []);
      }
      acc.get(metric.metric)!.push(metric);
      return acc;
    }, new Map<string, RunMessageMetricDTO[]>());
  });

  metricsNames = computed(() => {
    const metricsReduced = this.metricsReduced();
    return Array.from(metricsReduced.keys());
  });

  isRunError = computed(() => {
    return this.experimentData().error !== undefined ||
      this.experimentData().status?.toLowerCase() === RunStatusTypes.ERROR.toLowerCase();
  });

  getMetrics(metric: string): RunMessageMetricDTO[] {
    return this.metricsReduced().get(metric) || [];
  }

  protected readonly runStatusToBadgeStatus = runStatusToBadgeStatus;
}
