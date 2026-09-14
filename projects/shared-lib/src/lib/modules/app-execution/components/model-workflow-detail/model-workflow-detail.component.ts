import {ChangeDetectionStrategy, Component, computed, inject} from '@angular/core';
import {MatToolbarModule} from "@angular/material/toolbar";
import {MatButtonModule} from "@angular/material/button";
import {MatIconModule} from "@angular/material/icon";
import {MatSidenavModule} from "@angular/material/sidenav";
import {
  DataFileManagementComponent
} from "@shared-lib/modules/app-execution/components/data-file-managment/data-file-management.component";
import {Store} from "@ngrx/store";
import {MatDialog} from "@angular/material/dialog";
import {
  AiTaskExecutionComponent
} from "@shared-lib/modules/app-execution/components/ai-task-execution/ai-task-execution.component";
import {RunType} from "../../../../../../../global-app/src/app/modules/tool-development/dto/socket";
import {
  UserPromptInputComponent
} from "@shared-lib/modules/app-execution/components/user-prompt-input/user-prompt-input.component";
import {
  ModelWorkflowChatThreadComponent
} from "@shared-lib/modules/app-execution/components/model-workflow-chat-thread/model-workflow-chat-thread.component";
import {
  EmptyStateComponent
} from "@shared-lib/modules/app-execution/components/empty-state/empty-state.component";
import {
  StoreSelectDialogComponent
} from "@shared-lib/modules/store/components/store-select-dialog/store-select-dialog.component";
import {StoreSelectDialogData} from "@shared-lib/modules/store/model/store-select-dialog";
import {FederatedAppType} from "@shared-lib/modules/store/dto/enum";
import {StoreSelectDialogResult} from "@shared-lib/modules/store/components/model/model-select-dialog";
import {MatTooltip} from "@angular/material/tooltip";
import {DataAnalysisActions} from "@shared-lib/modules/app-execution/store/data-analysis/data-analysis.actions";
import {
  selectActiveTool,
  selectActiveToolHyperParams,
  selectDataAnalysisFilesForSelectedWorkflow,
  selectExecutionRunRunning,
  selectSelectedDataAnalysis,
  selectSelectedDataAnalysisWorkflow,
  selectSelectedTool,
  selectSelectedToolHyperParams
} from "@shared-lib/modules/app-execution/store/data-analysis/data-analysis.selectors";
import {SkeletonLoaderComponent} from "@shared-lib/components/skeleton-loader/skeleton-loader.component";
import {
  MarkdownDialogComponent,
  MarkdownDialogData
} from "@shared-lib/components/markdown-dialog/markdown-dialog.component";
import {ErrorCardComponent} from "@shared-lib/components/error-card/error-card.component";

@Component({
  selector: 'lib-model-workflow-detail',
  imports: [
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatSidenavModule,
    DataFileManagementComponent,
    AiTaskExecutionComponent,
    UserPromptInputComponent,
    ModelWorkflowChatThreadComponent,
    EmptyStateComponent,
    MatTooltip,
    SkeletonLoaderComponent,
    ErrorCardComponent
  ],
  templateUrl: './model-workflow-detail.component.html',
  styleUrl: './model-workflow-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ModelWorkflowDetailComponent {
  private readonly store: Store = inject(Store);
  private readonly dialog: MatDialog = inject(MatDialog);

  dataAnalysisState = this.store.selectSignal(selectSelectedDataAnalysis);
  experiment = this.store.selectSignal(selectSelectedDataAnalysisWorkflow);

  workflow = computed(() => this.dataAnalysisState()?.detail);
  loading = computed(() => this.dataAnalysisState()?.loading);
  error = computed(() => this.dataAnalysisState()?.error);

  workflowRunning = this.store.selectSignal(selectExecutionRunRunning);
  newTool = this.store.selectSignal(selectSelectedTool);
  activeTool = this.store.selectSignal(selectActiveTool);
  selectSelectedToolHyperParams = this.store.selectSignal(selectSelectedToolHyperParams);
  selectActiveToolHyperParams = this.store.selectSignal(selectActiveToolHyperParams);
  files = this.store.selectSignal(selectDataAnalysisFilesForSelectedWorkflow);
  generalFiles = this.store.selectSignal(selectDataAnalysisFilesForSelectedWorkflow);

  executionTool = computed(() => this.activeTool() ?? this.newTool());
  executionToolHyperParams = computed(() => this.selectActiveToolHyperParams() ?? this.selectSelectedToolHyperParams());
  workflowPending = computed(() => this.workflowRunning() && !this.executionTool());

  runType: RunType = RunType.EXPERIMENT_RUN;

  selectModelDialog() {
    const dialogRef = this.dialog.open(StoreSelectDialogComponent, {
      height: '80vh',
      width: '90vw',
      maxWidth: '100vw',
      autoFocus: false,
      data: {
        storeConfig: {
          hideWorkflow: false,
          onlyTrainedAnalysis: true,
          prefilter: {
            appType: [
              FederatedAppType.SELF_LEARNED,
              FederatedAppType.ANALYSIS,
              FederatedAppType.PRE_PROCESSING,
              FederatedAppType.POST_PROCESSING,
              FederatedAppType.EXTRACTOR,
              FederatedAppType.EVALUATION,
              FederatedAppType.DATA_TRANSFORMATION],
          }
        },
        allowMaximize: true
      } as StoreSelectDialogData,
    });

    dialogRef.afterClosed().subscribe((storeElement?: StoreSelectDialogResult) => {
      if (!storeElement) return;

      this.store.dispatch(DataAnalysisActions.selectStoreElement({storeElement}));
    });
  }

  protected openSummary() {
    const w = this.workflow();
    if (!w) return;
    if (w.llmSummary) {
      this.dialog.open(MarkdownDialogComponent, {
        height: '80vh',
        width: '90vw',
        maxWidth: '100vw',
        autoFocus: false,
        data: {
          title: w.name + " AI generated summary",
          markdown: w.llmSummary,
        } as MarkdownDialogData,
      });
    }
  }

  protected downloadReport() {
    const w = this.workflow();
    if (!w) return;
    this.store.dispatch(DataAnalysisActions.generateAndDownloadReport({id: w.id}));
  }
}
