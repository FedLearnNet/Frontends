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
import {ExperimentData} from "@shared-lib/modules/experiments/models/experiment-data";
import {runStatusToBadgeStatus} from "@shared-lib/utils/badge-status.helper";
import {FederatedLearningProjectActions} from "../../store/federated-learning-project.actions";
import {selectRunDetail, selectSelectedDetail} from "../../store/federated-learning-project.selectors";
import {SkeletonLoaderComponent} from "@shared-lib/components/skeleton-loader/skeleton-loader.component";
import {displayedAttempt} from "@shared-lib/modules/app-execution/dto/execution-run";

/** A step of this clinic's run of a training: what its app reported, read and wrote. */
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

  private readonly project = this.store.selectSignal(selectSelectedDetail);
  private readonly run = this.store.selectSignal(selectRunDetail);

  name = this.node.modelDetail ? this.node.modelDetail.name : this.node.appDetail?.name;

  step = computed(() => this.run()?.steps.find(step => step.workflowNodeId === this.node.id));

  experimentData = computed<ExperimentData | undefined>(() => {
    const step = this.step();
    const attempt = step ? displayedAttempt(step) : undefined;
    if (!step || !attempt) {
      return undefined;
    }
    return {
      logs: attempt.logs ?? [],
      metric: attempt.metrics ?? [],
      experimentId: step.runId,
      error: attempt.failure?.message ?? undefined,
      stepId: step.id,
      status: attempt.status,
      hyperParams: this.node.hyperParams,
      outputData: {
        data: attempt.outputData as { [key: string]: string },
        files: (attempt.outputFiles ?? []).map(file => file.file),
      },
      inputData: {
        data: {},
        files: (attempt.inputFiles ?? []).map(file => file.file),
      },
    };
  });

  ngOnInit(): void {
    const id = this.project()?.project.id;
    if (id) {
      this.store.dispatch(FederatedLearningProjectActions.loadRunDetail({id}));
    }
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  protected readonly runStatusToBadgeStatus = runStatusToBadgeStatus;
}
