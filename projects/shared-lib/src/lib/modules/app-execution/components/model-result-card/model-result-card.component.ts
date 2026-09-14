import {Component, ElementRef, inject, input, linkedSignal, signal, ViewChild} from '@angular/core';
import {
  AppRunOutputComponent
} from "@shared-lib/modules/app-execution/components/app-run-output/app-run-output.component";
import {DatePipe} from "@angular/common";
import {MatIconButton} from "@angular/material/button";
import {MatToolbar} from "@angular/material/toolbar";
import {MatIconModule} from "@angular/material/icon";
import {RunType} from "../../../../../../../global-app/src/app/modules/tool-development/dto/socket";
import {DataAnalysisResultDTO, DataAnalysisRunModesEnum} from "@shared-lib/modules/app-execution/dto/prediction";
import {TranslatePipe} from "@ngx-translate/core";
import {
  DownloadService
} from "../../../../../../../global-app/src/app/modules/tool-development/service/download.service";
import {MatTooltip} from "@angular/material/tooltip";
import {
  AppRunParamListComponent
} from "@shared-lib/modules/app-execution/components/app-run-param-list/app-run-param-list.component";
import {RunStatusTypes} from "../../../../../../../global-app/src/app/modules/tool-development/dto/test-run";
import {ErrorCardComponent} from "@shared-lib/components/error-card/error-card.component";
import {
  DataAnalysisWorkflowDetailDialogComponent,
  DataAnalysisWorkflowDetailDialogData
} from "@shared-lib/modules/app-execution/components/data-analysis-workflow-detail-dialog/data-analysis-workflow-detail-dialog.component";
import {MatDialog} from "@angular/material/dialog";
import {Store} from "@ngrx/store";
import {loadWorkflow} from "@shared-lib/modules/workflow/store/workflow.actions";
import {DataAnalysisFileDTO} from "@shared-lib/modules/app-execution/dto/model-workflow-file";
import {
  DataAnalysisResultAnalyzerDialogComponent
} from "@shared-lib/modules/app-execution/components/data-analysis-result-analyzer-dialog/data-analysis-result-analyzer-dialog.component";
import {DataAnalysisResultAnalyzerDialogData} from "@shared-lib/modules/app-execution/model/data-analyzer";
import {
  AiTaskExecutionInfoDialogComponent,
  TaskExecutionInfoDialogData
} from "@shared-lib/modules/app-execution/components/ai-task-execution-info-dialog/ai-task-execution-info-dialog.component";
import {BadgeComponent} from "@shared-lib/components/badge/badge.component";
import {DataAnalysisActions} from "@shared-lib/modules/app-execution/store/data-analysis/data-analysis.actions";

@Component({
  selector: 'lib-model-result-card',
  imports: [
    AppRunOutputComponent,
    DatePipe,
    MatIconModule,
    MatIconButton,
    MatToolbar,
    TranslatePipe,
    MatTooltip,
    AppRunParamListComponent,
    ErrorCardComponent,
    BadgeComponent
  ],
  templateUrl: './model-result-card.component.html',
  styleUrl: './model-result-card.component.scss'
})
export class ModelResultCardComponent {
  private readonly downloadService: DownloadService = inject(DownloadService);
  private readonly dialog: MatDialog = inject(MatDialog);
  private readonly store: Store = inject(Store);
  prediction = input.required<DataAnalysisResultDTO>();

  runType: RunType = RunType.EXPERIMENT_RUN;
  @ViewChild('result', {static: true}) topEl!: ElementRef<HTMLElement>;

  currentView = signal<number>(0);

  isError = linkedSignal(() => {
    return this.prediction().status.toLowerCase() === RunStatusTypes.ERROR.toLowerCase();
  });

  get appId(): number {
    return this.prediction().modelId!;
  }

  get runId(): number {
    return this.prediction().id;
  }

  downloadOutput(): void {
    const pred = this.prediction();
    if (pred.dataAnalysisId && pred.containerId) {
      this.store.dispatch(DataAnalysisActions.downloadResult({
        containerId: pred.containerId,
        mode: pred.runMode
      }));
    } else {
      this.downloadService.downloadZIP(this.appId, this.runId, RunType.EXPERIMENT_RUN).subscribe();
    }
  }

  showInput(): void {
    this.currentView.set(2);
    this.scrollToTop();
  }

  showWorkflowDetail(): void {
    const pred = this.prediction();
    if (pred.runMode === DataAnalysisRunModesEnum.PREDICTION) {
      return;
    }
    if (pred.currentWorkflowStepId === undefined ||
      pred.workflowRunId === undefined ||
      pred.workflowId === undefined
    ) {
      return;
    }
    const data: DataAnalysisWorkflowDetailDialogData = {
      experimentId: pred.workflowRunId,
      dataAnalysisId: pred.dataAnalysisId,
      workflowId: pred.workflowId
    };
    this.store.dispatch(loadWorkflow({id: pred.workflowId}));
    this.dialog.open(DataAnalysisWorkflowDetailDialogComponent, {
      height: '80vh',
      width: '90vw',
      maxWidth: '100vw',
      autoFocus: false,
      data: data,
    });
  }

  downloadWorkflowDetail(): void {
    const pred = this.prediction();
    const experimentId = pred.workflowRunId;
    if(!experimentId) {
      return;
    }
    this.store.dispatch(DataAnalysisActions.downloadWholeWorkflow({experimentId}));
  }

  showOutput(): void {
    this.currentView.set(0);
    this.scrollToTop();
  }

  showHyperParam(): void {
    this.currentView.set(1);
    this.scrollToTop();
  }

  openModelAnalyzeDialog(file: DataAnalysisFileDTO) {
    this.dialog.open(DataAnalysisResultAnalyzerDialogComponent, {
      height: '80vh',
      width: '90vw',
      maxWidth: '100vw',
      autoFocus: false,
      data: {
        dataAnalysisId: file.dataAnalysisId,
        fileId: file.id,
        title: file.outputName,
        file: file.file,
      } as DataAnalysisResultAnalyzerDialogData,
    });
  }

  private scrollToTop() {
    if (this.topEl?.nativeElement) {
      this.topEl.nativeElement.scrollIntoView({
        behavior: 'smooth', // or 'auto'
        block: 'start',
      });
    }
  }

  openDetail() {
    this.dialog.open(AiTaskExecutionInfoDialogComponent, {
      height: '80vh',
      width: '90vw',
      maxWidth: '100vw',
      autoFocus: false,
      data: this.prediction() as TaskExecutionInfoDialogData,
    });

  }

  protected readonly DataAnalysisRunModesEnum = DataAnalysisRunModesEnum;
  protected readonly RunStatusTypes = RunStatusTypes;
}
