import {Component, computed, inject, OnInit, signal} from '@angular/core';
import {
  WorkflowReadonlyViewComponent
} from "@shared-lib/modules/workflow/components/workflow-readonly-view/workflow-readonly-view.component";
import {WorkflowNodeDetailDTO} from "@shared-lib/modules/workflow/dto/workflow.dto";
import {Store} from "@ngrx/store";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {
  CloseableDialogTitleComponent
} from "@shared-lib/components/closeable-dialog-title/closeable-dialog-title.component";
import {selectSelectedWorkflow} from "@shared-lib/modules/workflow/store/workflow.selectors";
import {ErrorCardComponent} from "@shared-lib/components/error-card/error-card.component";
import {
  ExperimentWorkflowNodeDetailComponent
} from "@shared-lib/modules/experiments/components/experiment-workflow-node-detail/experiment-workflow-node-detail.component";
import {ExperimentData} from "@shared-lib/modules/experiments/models/experiment-data";
import {DataAnalysisWorkflowRunDTO} from "@shared-lib/modules/app-execution/dto/data-analysis-workflow";
import {DataAnalysisFileDTO} from "@shared-lib/modules/app-execution/dto/model-workflow-file";
import {MatToolbar} from "@angular/material/toolbar";
import {MatIcon} from "@angular/material/icon";
import {MatIconButton} from "@angular/material/button";
import {SkeletonLoaderComponent} from "@shared-lib/components/skeleton-loader/skeleton-loader.component";
import {StatusTitleComponent} from "@shared-lib/components/status-title/status-title.component";
import {runStatusToBadgeStatus} from "@shared-lib/utils/badge-status.helper";
import {DataAnalysisActions} from "@shared-lib/modules/app-execution/store/data-analysis/data-analysis.actions";
import {
  selectSelectedDataAnalysisWorkflow
} from "@shared-lib/modules/app-execution/store/data-analysis/data-analysis.selectors";

export interface DataAnalysisWorkflowDetailDialogData {
  workflowId: number;
  dataAnalysisId: number;
  experimentId: number;
}

@Component({
  selector: 'lib-data-analysis-workflow-detail-dialog',
  imports: [
    WorkflowReadonlyViewComponent,
    CloseableDialogTitleComponent,
    ErrorCardComponent,
    ExperimentWorkflowNodeDetailComponent,
    MatToolbar,
    MatIcon,
    MatIconButton,
    SkeletonLoaderComponent,
    StatusTitleComponent
  ],
  templateUrl: './data-analysis-workflow-detail-dialog.component.html',
  styleUrl: './data-analysis-workflow-detail-dialog.component.scss',
})
export class DataAnalysisWorkflowDetailDialogComponent implements OnInit {
  private readonly store: Store = inject(Store);
  private readonly dialogRef = inject(MatDialogRef<DataAnalysisWorkflowDetailDialogComponent>);
  public data = inject<DataAnalysisWorkflowDetailDialogData>(MAT_DIALOG_DATA);

  workflow = this.store.selectSignal(selectSelectedWorkflow);
  experiment = this.store.selectSignal(selectSelectedDataAnalysisWorkflow);

  selectedNode = signal<WorkflowNodeDetailDTO | undefined>(undefined);

  dialogTitle = computed(() => {
    const wf = this.workflow();
    return wf ? wf.name ?? "Loading" : "Loading";
  });

  selectedStep = computed(() => {
    const experiment = this.experiment();
    const selectedNode = this.selectedNode();
    if (!experiment || !selectedNode) {
      return undefined;
    }
    return this.findSelectedStep(experiment, selectedNode);
  })
  experimentData = computed(() => {
    const experiment = this.experiment();
    const selectedNode = this.selectedNode();
    const step = this.selectedStep();
    if (!experiment || !selectedNode || !step) {
      return undefined;
    }

    return {
      logs: step.logs ?? [],
      metric: step.metrics ?? [],
      experimentId: experiment.id,
      error: step.lastError,
      stepId: step.id,
      status: step.stepStatus,
      hyperParams: selectedNode.hyperParams,
      outputData: {
        data: step.result,
        files: this.mapFiles(step.outputFiles),
      },
      inputData: {
        data: {},
        files: this.mapFiles(step.inputFiles),
      },
    } as ExperimentData;
  })

  ngOnInit() {
    this.store.dispatch(DataAnalysisActions.loadDataAnalysisWorkflowRun({
      id: this.data.dataAnalysisId,
      experimentId: this.data.experimentId
    }));
  }

  findSelectedStep(experiment: DataAnalysisWorkflowRunDTO, node: WorkflowNodeDetailDTO) {
    if (!experiment.steps) {
      return undefined;
    }
    return experiment.steps.find((s) => s.workflowNodeId === node.id);
  }

  mapFiles(files?: DataAnalysisFileDTO[]) {
    if (!files) {
      return [];
    }
    return files.map(file => file.file);
  }

  getStepName() {
    const node = this.selectedNode();
    if (!node) return '';
    return node.modelDetail ? node.modelDetail.name : node.appDetail?.name;
  }

  toggleMaximize(isMaximized: boolean): void {
    if (isMaximized) {
      this.dialogRef.updateSize('100vw', '100vh');
    } else {
      this.dialogRef.updateSize('90vw', '80vh');
    }
  }

  showDetail(node: WorkflowNodeDetailDTO): void {
    this.selectedNode.set(node);
  }

  hideDetail(): void {
    this.selectedNode.set(undefined)
  }

  protected readonly runStatusToBadgeStatus = runStatusToBadgeStatus;
}
