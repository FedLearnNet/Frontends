import {ChangeDetectionStrategy, Component, computed, inject, OnInit} from '@angular/core';
import {
  ExperimentWorkflowNodeDetailComponent
} from "@shared-lib/modules/experiments/components/experiment-workflow-node-detail/experiment-workflow-node-detail.component";
import {MatButton} from "@angular/material/button";
import {MAT_DIALOG_DATA, MatDialogActions, MatDialogContent, MatDialogRef} from "@angular/material/dialog";
import {StatusTitleComponent} from "@shared-lib/components/status-title/status-title.component";
import {TranslatePipe} from "@ngx-translate/core";
import {Store} from "@ngrx/store";
import {WorkflowNodeDetailDTO} from "@shared-lib/modules/workflow/dto/workflow.dto";
import {RunMessageMetricDTO} from "@shared-lib/modules/experiments/dto/log";
import {ExperimentData} from "@shared-lib/modules/experiments/models/experiment-data";
import {projectStatusToBadgeStatus, runStatusToBadgeStatus} from "@shared-lib/utils/badge-status.helper";
import {FederatedLearningProjectActions} from "../../store/federated-learning-project.actions";
import {
  selectCurrentLogs,
  selectCurrentStepDetail,
  selectSelectedDetail
} from "../../store/federated-learning-project.selectors";
import {SkeletonLoaderComponent} from "@shared-lib/components/skeleton-loader/skeleton-loader.component";

@Component({
  selector: 'app-training-step-detail',
  imports: [
    ExperimentWorkflowNodeDetailComponent,
    MatButton,
    MatDialogActions,
    MatDialogContent,
    StatusTitleComponent,
    TranslatePipe,
    SkeletonLoaderComponent
  ],
  templateUrl: './training-step-detail.component.html',
  styleUrl: './training-step-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TrainingStepDetailComponent implements OnInit {
  private readonly dialogRef = inject(MatDialogRef<TrainingStepDetailComponent>);
  private readonly store: Store = inject(Store);
  readonly node = inject<WorkflowNodeDetailDTO>(MAT_DIALOG_DATA);

  logs = this.store.selectSignal(selectCurrentLogs);
  detail = this.store.selectSignal(selectCurrentStepDetail);
  project = this.store.selectSignal(selectSelectedDetail);

  metrics: RunMessageMetricDTO[] = [];

  name = this.node.modelDetail ? this.node.modelDetail.name : this.node.appDetail?.name;


  experimentData = computed(() => {
    const project = this.project();
    if (!project) {
      return undefined;
    }
    const experiment = project.experiment;
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
      status: detail.stepStatus as any,
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
    this.store.dispatch(FederatedLearningProjectActions.selectLocalStep({nodeId: this.node.id}));
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  protected readonly runStatusToBadgeStatus = runStatusToBadgeStatus;

  protected readonly projectStatusToBadgeStatus = projectStatusToBadgeStatus;
}
