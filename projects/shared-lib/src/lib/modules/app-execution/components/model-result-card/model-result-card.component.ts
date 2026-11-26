import {ChangeDetectionStrategy, Component, computed, ElementRef, inject, input, signal, ViewChild} from '@angular/core';
import {
  AppRunOutputComponent
} from "@shared-lib/modules/app-execution/components/app-run-output/app-run-output.component";
import {DatePipe} from "@angular/common";
import {MatIconButton} from "@angular/material/button";
import {MatToolbar} from "@angular/material/toolbar";
import {MatIconModule} from "@angular/material/icon";
import {RunType} from "../../../../../../../global-app/src/app/modules/tool-development/dto/socket";
import {DataAnalysisRunModesEnum} from "@shared-lib/modules/app-execution/dto/prediction";
import {
  currentStep,
  DataAnalysisAttemptDTO,
  DataAnalysisRunDTO,
  displayedAttempt,
  errorOf
} from "@shared-lib/modules/app-execution/dto/execution-run";
import {TranslatePipe} from "@ngx-translate/core";
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
  taskExecutionInfoOf
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
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './model-result-card.component.scss'
})
export class ModelResultCardComponent {
  private readonly dialog: MatDialog = inject(MatDialog);
  private readonly store: Store = inject(Store);
  run = input.required<DataAnalysisRunDTO>();

  runType: RunType = RunType.EXPERIMENT_RUN;
  @ViewChild('result', {static: true}) topEl!: ElementRef<HTMLElement>;

  currentView = signal<number>(0);

  isWorkflow = computed(() => this.run().workflowId != null);
  step = computed(() => currentStep(this.run()));
  attempt = computed(() => {
    const step = this.step();
    return step ? displayedAttempt(step) : undefined;
  });
  stepPosition = computed(() => {
    const step = this.step();
    return step ? this.run().steps.indexOf(step) + 1 : 0;
  });
  error = computed(() => errorOf(this.run()));
  isError = computed(() => this.run().status === RunStatusTypes.ERROR);

  // A workflow shows what all its steps wrote, the inputs the run was started with.
  outputData = computed(() => Object.assign({}, ...this.attempts().map(attempt => attempt.outputData ?? {})));
  outputFiles = computed(() => this.attempts().flatMap(attempt => attempt.outputFiles ?? []));
  inputs = computed(() => this.run().steps[0]?.inputs ?? {});
  inputFiles = computed(() => {
    const first = this.run().steps[0];
    return (first && displayedAttempt(first)?.inputFiles) ?? [];
  });
  hyperParams = computed(() => this.attempt()?.params ?? {});

  get appId(): number {
    return this.step()?.modelId ?? 0;
  }

  private attempts(): DataAnalysisAttemptDTO[] {
    return this.run().steps
      .map(step => displayedAttempt(step))
      .filter((attempt): attempt is DataAnalysisAttemptDTO => !!attempt);
  }

  downloadOutput(): void {
    const containerId = this.attempt()?.containerId;
    if (!containerId) {
      return;
    }
    this.store.dispatch(DataAnalysisActions.downloadResult({
      containerId,
      mode: this.isWorkflow() ? DataAnalysisRunModesEnum.WORKFLOW : DataAnalysisRunModesEnum.PREDICTION
    }));
  }

  showInput(): void {
    this.currentView.set(2);
    this.scrollToTop();
  }

  showWorkflowDetail(): void {
    const run = this.run();
    if (run.workflowId == null || run.dataAnalysisId == null) {
      return;
    }
    const data: DataAnalysisWorkflowDetailDialogData = {
      experimentId: run.id,
      dataAnalysisId: run.dataAnalysisId,
      workflowId: run.workflowId
    };
    this.store.dispatch(loadWorkflow({id: run.workflowId}));
    this.dialog.open(DataAnalysisWorkflowDetailDialogComponent, {
      height: '80vh',
      width: '90vw',
      maxWidth: '100vw',
      autoFocus: false,
      data: data,
    });
  }

  downloadWorkflowDetail(): void {
    this.store.dispatch(DataAnalysisActions.downloadWholeWorkflow({experimentId: this.run().id}));
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
      data: taskExecutionInfoOf(this.run()),
    });

  }

  protected readonly RunStatusTypes = RunStatusTypes;
}
