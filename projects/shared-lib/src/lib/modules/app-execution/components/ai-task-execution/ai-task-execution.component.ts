import {Component, computed, effect, inject, input, linkedSignal, signal, ChangeDetectionStrategy} from '@angular/core';
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
  selectExecutionLastRunForAnalysis,
  selectExecutionRunRunning
} from "@shared-lib/modules/app-execution/store/data-analysis/data-analysis.selectors";
import {
  AiTaskExecutionInfoDialogComponent,
  taskExecutionInfoOf
} from "@shared-lib/modules/app-execution/components/ai-task-execution-info-dialog/ai-task-execution-info-dialog.component";
import {MatDialog} from "@angular/material/dialog";
import {MatTooltip} from "@angular/material/tooltip";
import {WorkflowNodeDetailDTO} from "@shared-lib/modules/workflow/dto/workflow.dto";
import {
  currentStep,
  displayedAttempt,
  errorOf,
  hasFinishedStep
} from "@shared-lib/modules/app-execution/dto/execution-run";
import {RunStatusTypes} from "../../../../../../../global-app/src/app/modules/tool-development/dto/test-run";
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
  changeDetection: ChangeDetectionStrategy.Eager,
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

  run = this.store.selectSignal(selectExecutionLastRunForAnalysis(this.modelWorkflow()));
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

  step = computed(() => {
    const run = this.run();
    return run ? currentStep(run) : undefined;
  });

  attempt = computed(() => {
    const step = this.step();
    return step ? displayedAttempt(step) : undefined;
  });

  stepPosition = computed(() => {
    const run = this.run();
    const step = this.step();
    return run && step ? run.steps.indexOf(step) + 1 : 0;
  });

  error = computed(() => {
    const run = this.run();
    return run ? errorOf(run) : undefined;
  });

  lastLog = computed(() => this.attempt()?.lastLog);
  outputData = computed(() => this.attempt()?.outputData ?? {});
  appId = computed(() => this.step()?.modelId ?? 0);

  currentWorkflowNode = computed<WorkflowNodeDetailDTO | null>(() => {
    const step = this.step();
    const workflow = this.workflow();
    if (!step || !workflow) {
      return null;
    }
    return workflow.nodes.find((node) => node.id === step.workflowNodeId) ?? null;
  });

  canOpenWorkflowDetail = computed(() => this.run()?.workflowId != null);

  // A workflow step finished and the next one has not started yet.
  waitingForNextWorkflowStep = computed(() => {
    const run = this.run();
    return !!run && run.workflowId != null && this.executionRunning() &&
      this.step()?.status === RunStatusTypes.PENDING && hasFinishedStep(run);
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
    const run = this.run();
    if (this.executionRunning()) {
      this.viewState.set(ViewState.STATUS);
    }

    if (run?.status) {
      this.viewState.set(ViewState.STATUS);
      if (run.status === RunStatusTypes.FINISHED && !this.executionRunning()) {
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
      this.store.dispatch(DataAnalysisActions.startAnalysisRun({dataAnalysisId: this.modelWorkflow()!, data: toCreate}));
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
    const run = this.run();
    if (!run) return;
    this.dialog.open(AiTaskExecutionInfoDialogComponent, {
      height: '80vh',
      width: '90vw',
      maxWidth: '100vw',
      autoFocus: false,
      data: taskExecutionInfoOf(run),
    });

  }

  openWorkflowDetail() {
    const run = this.run();
    if (!run || run.workflowId == null || run.dataAnalysisId == null) {
      return;
    }

    this.store.dispatch(loadWorkflow({id: run.workflowId}));
    this.dialog.open(DataAnalysisWorkflowDetailDialogComponent, {
      height: '80vh',
      width: '90vw',
      maxWidth: '100vw',
      autoFocus: false,
      data: {
        workflowId: run.workflowId,
        dataAnalysisId: run.dataAnalysisId,
        experimentId: run.id,
      } as DataAnalysisWorkflowDetailDialogData,
    });
  }

  stopExecution() {
    const run = this.run();
    const dataAnalysisId = run?.dataAnalysisId ?? this.modelWorkflow();
    if (!run || dataAnalysisId == null) return;

    this.store.dispatch(DataAnalysisActions.stopRun({dataAnalysisId, id: run.id}));
  }

  getHyperParamName(hyperparam: ToolHyperParamConfigDTO): string {
    return hyperparam.variableName ? hyperparam.variableName : hyperparam.name;
  }

  protected readonly stop = stop;
}
