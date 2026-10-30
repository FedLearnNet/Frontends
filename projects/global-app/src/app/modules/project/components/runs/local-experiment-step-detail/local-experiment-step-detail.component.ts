import {ChangeDetectionStrategy, Component, computed, inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogActions, MatDialogContent, MatDialogRef} from "@angular/material/dialog";
import {MatButtonModule} from "@angular/material/button";
import {
  ExperimentWorkflowNodeDetailComponent
} from "@shared-lib/modules/experiments/components/experiment-workflow-node-detail/experiment-workflow-node-detail.component";
import {StatusTitleComponent} from "@shared-lib/components/status-title/status-title.component";
import {runStatusToBadgeStatus} from "@shared-lib/utils/badge-status.helper";
import {Store} from "@ngrx/store";
import {WorkflowNodeDetailDTO} from "@shared-lib/modules/workflow/dto/workflow.dto";
import {TranslatePipe} from "@ngx-translate/core";
import {ExperimentData} from "@shared-lib/modules/experiments/models/experiment-data";
import {displayedAttempt} from "@shared-lib/modules/app-execution/dto/execution-run";
import {ProjectRunsActions} from "@global-app/project/store/project-runs.actions";
import {selectSelectedRun, selectSelectedRunDetail} from "@global-app/project/store/project-runs.selectors";
import {kindOf, projectIdOf} from "@global-app/project/dto/project-experiments";

/**
 * A step of a training: what its app reported, read and wrote. Only a training on the platform has them,
 * across clinics the clinics run the steps.
 */
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

  private readonly run = this.store.selectSignal(selectSelectedRun);
  private readonly detail = this.store.selectSignal(selectSelectedRunDetail);

  name = this.node.modelDetail ? this.node.modelDetail.name : this.node.appDetail?.name;

  isTest = computed(() => this.run()?.experiment?.test ?? true);

  step = computed(() => {
    const run = this.detail()?.id === this.run()?.id ? this.detail() : this.run();
    return run?.steps.find(step => step.workflowNodeId === this.node.id);
  });

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
    const run = this.run();
    const projectId = run ? projectIdOf(run) : undefined;
    if (run && projectId && kindOf(run) === 'local') {
      this.store.dispatch(ProjectRunsActions.loadDetail({projectId, runId: run.id}));
    }
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  protected readonly runStatusToBadgeStatus = runStatusToBadgeStatus;
}
