import {Component, computed, effect, inject, input, linkedSignal, signal} from '@angular/core';
import {ReactiveFormsModule} from "@angular/forms";
import {NgClass} from "@angular/common";
import {MatSelectModule} from "@angular/material/select";
import {MatButtonModule} from "@angular/material/button";
import {MatInputModule} from "@angular/material/input";
import {DataAnalysisCreatePredictionDTO} from "@shared-lib/modules/app-execution/dto/prediction";
import {
  AppRunHyperparameterComponent
} from "@shared-lib/modules/app-execution/components/app-run-hyperparameter/app-run-hyperparameter.component";
import {TranslatePipe} from "@ngx-translate/core";
import {AppRunInputComponent} from "@shared-lib/modules/app-execution/components/app-run-input/app-run-input.component";
import {animate, style, transition, trigger} from "@angular/animations";
import {
  AppRunOutputComponent
} from "@shared-lib/modules/app-execution/components/app-run-output/app-run-output.component";
import {RunType} from "../../../../../../../global-app/src/app/modules/tool-development/dto/socket";
import {DataAnalysisFileDTO} from "@shared-lib/modules/app-execution/dto/model-workflow-file";
import {Store} from "@ngrx/store";
import {MatToolbar} from "@angular/material/toolbar";
import {MatIcon} from "@angular/material/icon";
import {ToolHyperParamConfigDTO, ToolInputConfigDTO} from "@shared-lib/modules/app-execution/dto/config";
import {HintCardComponent} from "@shared-lib/components/hint-card/hint-card.component";
import {ErrorCardComponent} from "@shared-lib/components/error-card/error-card.component";
import {StoreSelectDialogResult} from "@shared-lib/modules/store/components/model/model-select-dialog";
import {DataAnalysisActions} from "@shared-lib/modules/app-execution/store/data-analysis/data-analysis.actions";
import {TimeBadgeComponent} from "@shared-lib/components/time-badge/time-badge.component";
import {SkeletonLoaderComponent} from "@shared-lib/components/skeleton-loader/skeleton-loader.component";
import {BadgeComponent} from "@shared-lib/components/badge/badge.component";
import {
  selectExecutionLastRunPredictionForWorkflow,
  selectExecutionRunRunning
} from "@shared-lib/modules/app-execution/store/data-analysis/data-analysis.selectors";
import {
  AiTaskExecutionInfoDialogComponent,
  TaskExecutionInfoDialogData
} from "@shared-lib/modules/app-execution/components/ai-task-execution-info-dialog/ai-task-execution-info-dialog.component";
import {MatDialog} from "@angular/material/dialog";
import {MatTooltip} from "@angular/material/tooltip";
import {WorkflowNodeDetailDTO} from "@shared-lib/modules/workflow/dto/workflow.dto";
import {loadWorkflow} from "@shared-lib/modules/workflow/store/workflow.actions";
import {
  DataAnalysisWorkflowDetailDialogComponent,
  DataAnalysisWorkflowDetailDialogData
} from "@shared-lib/modules/app-execution/components/data-analysis-workflow-detail-dialog/data-analysis-workflow-detail-dialog.component";

enum ViewState {
  SELECTION, STATUS, RESULT
}

@Component({
  selector: 'lib-ai-task-execution',
  imports: [
    MatSelectModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatInputModule,
    AppRunHyperparameterComponent,
    TranslatePipe,
    AppRunInputComponent,
    NgClass,
    AppRunOutputComponent,
    MatToolbar,
    MatIcon,
    HintCardComponent,
    ErrorCardComponent,
    TimeBadgeComponent,
    SkeletonLoaderComponent,
    BadgeComponent,
    MatTooltip
  ],
  templateUrl: './ai-task-execution.component.html',
  styleUrl: './ai-task-execution.component.scss',
  animations: [
    trigger('containerAnim', [
      transition(':enter', [
        style({opacity: 0, transform: 'scale(0.9)'}),
        animate('300ms ease-out', style({opacity: 1, transform: 'scale(1)'})),
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({opacity: 0, transform: 'scale(0.9)'})),
      ]),
    ]),
    trigger('statusAnim', [
      transition('* => *', [
        style({opacity: 0, transform: 'translateY(-10px)'}),
        animate('300ms ease-out', style({opacity: 1, transform: 'translateY(0)'})),
      ]),
    ]),
  ]
})
export class AiTaskExecutionComponent {
  private readonly store: Store = inject(Store);
  private readonly dialog: MatDialog = inject(MatDialog);

  storeElement = input.required<StoreSelectDialogResult>();
  inputHyperParams = input<{ [key: string]: any } | null | undefined>();
  workflowFiles = input<DataAnalysisFileDTO[]>();

  modelWorkflow = input<number>();

  modelPrediction = this.store.selectSignal(selectExecutionLastRunPredictionForWorkflow(this.modelWorkflow()));
  executionRunning = this.store.selectSignal(selectExecutionRunRunning);

  viewState = signal<ViewState>(ViewState.SELECTION);
  showConfig = signal<boolean>(false);

  federatedApp = computed(() => {
    const storeElement = this.storeElement();
    if (storeElement.model) {
      return storeElement.model.federatedApp;
    }
    return storeElement.app!
  })

  workflow = computed(() => {
    const storeElement = this.storeElement();
    return storeElement.workflow;
  });

  currentWorkflowNode = computed<WorkflowNodeDetailDTO | null>(() => {
    const prediction = this.modelPrediction() as any;
    const workflow = this.workflow();
    if (!prediction || !workflow) {
      return null;
    }

    if (prediction.currentWorkflowStepId != null) {
      return workflow.nodes.find((node) => node.id === prediction.currentWorkflowStepId) ?? null;
    }

    if (prediction.currentWorkflowStep != null) {
      return workflow.nodes.find((node) => node.executionOrder === prediction.currentWorkflowStep) ?? null;
    }

    return null;
  });

  canOpenWorkflowDetail = computed(() => {
    const prediction = this.modelPrediction() as any;
    return prediction?.workflowId != null && prediction?.workflowRunId != null;
  });

  waitingForNextWorkflowStep = computed(() => {
    const prediction = this.modelPrediction();
    return !!this.modelWorkflow() &&
      this.executionRunning() &&
      String(prediction?.status ?? '').toLowerCase() === 'finished';
  });

  name = computed(() => {
    const storeElement = this.storeElement();
    if (storeElement.model) {
      return storeElement.model.name;
    }
    if (storeElement.workflow) {
      return storeElement.workflow.name;
    }
    return storeElement.app!.name;
  })

  inputs: { [key: string]: any } = {};

  inputValid: boolean = true;
  hyperParamValid: boolean = true;

  runType: RunType = RunType.EXPERIMENT_RUN;

  hyperParams = linkedSignal(() => {
    if (this.workflow()) {
      return {};
    }
    const inputHyperParams = this.inputHyperParams() ?? {};
    return Object.fromEntries(
      this.federatedApp().appConfig.hyperparams.map(entry => {
        const key = this.getHyperParamName(entry);
        return [
          key,
          key in inputHyperParams
            ? inputHyperParams[key]
            : entry.default
        ];
      })
    );
  });

  private readonly statusEffect = effect(() => {
    const model = this.modelPrediction();
    if (this.executionRunning()) {
      this.viewState.set(ViewState.STATUS);
    }

    if (model?.status) {
      this.viewState.set(ViewState.STATUS);
      if (model.status.toLowerCase() === 'finished' && !this.executionRunning()) {
        this.viewState.set(ViewState.RESULT);
      }
    } else if (!this.executionRunning()) {
      this.viewState.set(ViewState.SELECTION);
    }

  });

  public toggleConfig() {
    this.showConfig.update(b => !b);
  }

  changeInput(data: { [key: string]: any }): void {
    let allValid = true;
    const input: ToolInputConfigDTO[] = this.workflow()?.inputs ?? this.federatedApp().appConfig.input;
    input.forEach((input) => {
      const name = input.variableName ?? input.name;
      const isRequired = input.required;
      if (isRequired) {
        if (!data[name] || data[name].length === 0) {
          allValid = false;
        }
      }
    });
    this.inputValid = allValid;
    this.inputs = data;
  }


  startExecution(): void {
    if (!this.isValid) {
      return;
    }

    const toCreate: DataAnalysisCreatePredictionDTO = {
      inputs: this.inputs,
      hyperParams: this.hyperParams()
    }
    if (this.storeElement().model) {
      toCreate.modelSubId = this.storeElement().model!.lastVersion?.selectedSubModel?.id || null;
      toCreate.modelVersionId = this.storeElement().model!.lastVersion?.id;
    } else if (this.federatedApp()) {
      toCreate.appVersionId = this.federatedApp().latestVersionId;
    } else if (this.workflow()) {
      toCreate.workflowId = this.workflow()?.id;
    }

    if (this.modelWorkflow()) {
      this.store.dispatch(DataAnalysisActions.startWorkflowRun({workflowId: this.modelWorkflow()!, data: toCreate}));
    } else {
      this.store.dispatch(DataAnalysisActions.startRun({data: toCreate}));
    }
  }

  exitExecution(): void {
    this.store.dispatch(DataAnalysisActions.unselectStoreElement())
  }

  get isValid(): boolean {
    return this.inputValid && this.hyperParamValid;
  }

  openDetail() {
    if (!this.modelPrediction()) return;
    this.dialog.open(AiTaskExecutionInfoDialogComponent, {
      height: '80vh',
      width: '90vw',
      maxWidth: '100vw',
      autoFocus: false,
      data: this.modelPrediction() as TaskExecutionInfoDialogData,
    });

  }

  openWorkflowDetail() {
    const prediction = this.modelPrediction() as any;
    if (!prediction || prediction.workflowId == null || prediction.workflowRunId == null) {
      return;
    }

    this.store.dispatch(loadWorkflow({id: prediction.workflowId}));
    this.dialog.open(DataAnalysisWorkflowDetailDialogComponent, {
      height: '80vh',
      width: '90vw',
      maxWidth: '100vw',
      autoFocus: false,
      data: {
        workflowId: prediction.workflowId,
        dataAnalysisId: prediction.dataAnalysisId,
        experimentId: prediction.workflowRunId,
      } as DataAnalysisWorkflowDetailDialogData,
    });
  }

  stopExecution() {
    const prediction = this.modelPrediction();
    if (!prediction || prediction.id == null) return;

    const id = prediction.id;
    if (prediction.dataAnalysisId != null && prediction.workflowId != null) {
      const dataAnalysisId = prediction.dataAnalysisId;
      const workflowId = prediction.workflowId;

      this.store.dispatch(
        DataAnalysisActions.stopWorkflowRun({
          dataAnalysisId,
          id,
          workflowId,
        })
      );
      return;
    }
    const dataAnalysisId = this.modelWorkflow();
    if (dataAnalysisId == null) return;

    this.store.dispatch(
      DataAnalysisActions.stopRun({
        dataAnalysisId,
        id,
      })
    );
  }

  getHyperParamName(hyperparam: ToolHyperParamConfigDTO): string {
    return hyperparam.variableName ? hyperparam.variableName : hyperparam.name;
  }

  protected readonly stop = stop;
}
