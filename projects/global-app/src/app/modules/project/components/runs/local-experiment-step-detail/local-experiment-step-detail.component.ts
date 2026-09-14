import {ChangeDetectionStrategy, Component, computed, inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogActions, MatDialogContent, MatDialogRef} from "@angular/material/dialog";
import {RunMessageMetricDTO} from "@shared-lib/modules/experiments/dto/log";
import {MatButtonModule} from "@angular/material/button";
import {
  ExperimentWorkflowNodeDetailComponent
} from "@shared-lib/modules/experiments/components/experiment-workflow-node-detail/experiment-workflow-node-detail.component";
import {StatusTitleComponent} from "@shared-lib/components/status-title/status-title.component";
import {runStatusToBadgeStatus} from "@shared-lib/utils/badge-status.helper";
import {Store} from "@ngrx/store";
import {
  selectCurrentLogs,
  selectCurrentStepDetail,
  selectSelectedExperiment
} from "@global-app/project/store/project-local-experiments.selectors";
import {WorkflowNodeDetailDTO} from "@shared-lib/modules/workflow/dto/workflow.dto";
import {TranslatePipe} from "@ngx-translate/core";
import {ProjectLocalExperimentsActions} from "@global-app/project/store/project-local-experiments.actions";
import {ExperimentData} from "@shared-lib/modules/experiments/models/experiment-data";


@Component({
  selector: 'app-local-experiment-step-detail',
  imports: [
    MatButtonModule,
    MatDialogContent,
    MatDialogActions,
    ExperimentWorkflowNodeDetailComponent,
    StatusTitleComponent,
    TranslatePipe,
  ],
  templateUrl: './local-experiment-step-detail.component.html',
  styleUrl: './local-experiment-step-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LocalExperimentStepDetailComponent implements OnInit {
  private readonly dialogRef = inject(MatDialogRef<LocalExperimentStepDetailComponent>);
  private readonly store: Store = inject(Store);
  readonly node = inject<WorkflowNodeDetailDTO>(MAT_DIALOG_DATA);

  logs = this.store.selectSignal(selectCurrentLogs);
  detail = this.store.selectSignal(selectCurrentStepDetail);
  experiment = this.store.selectSignal(selectSelectedExperiment);

  isTestExperiment = computed(() => this.experiment()?.testRun ?? true);
  metrics: RunMessageMetricDTO[] = [];

  name = this.node.modelDetail ? this.node.modelDetail.name : this.node.appDetail?.name;


  experimentData = computed(() => {
    const experiment = this.experiment();
    const detail = this.detail();
    if (!experiment || !detail) {
      return undefined;
    }
    return {
      logs: this.logs() ?? [],
      metric: detail.metrics,
      experimentId: experiment.id,
      error: detail.lastError,
      stepId: detail.id,
      status: detail.stepStatus,
      hyperParams: this.node.hyperParams,
      outputData: {
        data: detail.result,
        files: detail.outputFiles,
      },
      inputData: {
        data: {},
        files: detail.inputFiles,
      },
    } as ExperimentData;
  })

  ngOnInit(): void {
    this.store.dispatch(ProjectLocalExperimentsActions.selectLocalStep({nodeId: this.node.id}));
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  protected readonly runStatusToBadgeStatus = runStatusToBadgeStatus;

}
