import {ChangeDetectionStrategy, Component, computed, effect, inject, signal} from '@angular/core';
import {ProjectStatus} from "@global-app/project/dto/project";
import {MatIconModule} from "@angular/material/icon";
import {StatusBadgeComponent} from "@shared-lib/components/status-badge/status-badge.component";
import {projectStatusToBadgeStatus, runStatusToBadgeStatus} from "@shared-lib/utils/badge-status.helper";
import {animate} from "@angular/animations";
import {
  ModelVersionDetailViewComponent
} from "@global-app/model-store/components/model-version-detail-view/model-version-detail-view.component";
import {selectSelectedProject} from "@global-app/project/store/project.selectors";
import {Store} from "@ngrx/store";
import {
  selectConnectedById,
  selectError,
  selectLoading,
  selectSelectedExperiment
} from "@global-app/project/store/project-federated-experiments.selectors";
import {ProjectFederatedExperimentsActions} from "@global-app/project/store/project-federated-experiments.actions";
import {
  ExperimentHeaderComponent
} from "@global-app/project/components/runs/experiment-header/experiment-header.component";
import {InfoGridComponent} from "@shared-lib/components/info-grid/info-grid.component";
import {InfoItemComponent} from "@shared-lib/components/info-item/info-item.component";
import {BadgeComponent} from "@shared-lib/components/badge/badge.component";
import {MatTabsModule} from "@angular/material/tabs";
import {
  WorkflowReadonlyViewComponent
} from "@shared-lib/modules/workflow/components/workflow-readonly-view/workflow-readonly-view.component";
import {WorkflowNodeDetailDTO} from "@shared-lib/modules/workflow/dto/workflow.dto";
import {
  LocalExperimentStepDetailComponent
} from "@global-app/project/components/runs/local-experiment-step-detail/local-experiment-step-detail.component";
import {MatDialog} from "@angular/material/dialog";
import {selectSelectedWorkflow} from "@shared-lib/modules/workflow/store/workflow.selectors";
import * as WorkflowActions from "@shared-lib/modules/workflow/store/workflow.actions";
import {PageWrapperComponent} from "@shared-lib/components/page-wrapper/page-wrapper.component";
import {WorkflowTrainingHelperService} from "@shared-lib/modules/workflow/service/workflow-traning.helper";
import {EmptyStateComponent} from "@shared-lib/modules/app-execution/components/empty-state/empty-state.component";
import {
  LocalMetricsTabComponent
} from "@global-app/project/components/runs/detail-federated-experiment/local-metrics-tab/local-metrics-tab.component";
import {
  EvaluationTabComponent
} from "@global-app/project/components/runs/detail-federated-experiment/evaluation-tab/evaluation-tab.component";

@Component({
  selector: 'app-detail-federated-experiment',
  imports: [
    MatIconModule,
    StatusBadgeComponent,
    ModelVersionDetailViewComponent,
    ExperimentHeaderComponent,
    InfoGridComponent,
    InfoItemComponent,
    BadgeComponent,
    MatTabsModule,
    WorkflowReadonlyViewComponent,
    PageWrapperComponent,
    EmptyStateComponent,
    LocalMetricsTabComponent,
    EvaluationTabComponent,
  ],
  templateUrl: './detail-federated-experiment.component.html',
  styleUrl: './detail-federated-experiment.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DetailFederatedExperimentComponent {
  private readonly store: Store = inject(Store);
  private readonly dialog: MatDialog = inject(MatDialog);
  private readonly wths: WorkflowTrainingHelperService = inject(WorkflowTrainingHelperService);
  project = this.store.selectSignal(selectSelectedProject);

  experiment = this.store.selectSignal(selectSelectedExperiment);
  error = this.store.selectSignal(selectError);
  selectedWorkflow = this.store.selectSignal(selectSelectedWorkflow);
  loading = this.store.selectSignal(selectLoading);

  private readonly projectId = computed(() => this.project()?.id ?? null);

  connected = computed(() => {
    const id = this.experiment()?.id;
    if (!id) return false;
    return this.store.selectSignal(selectConnectedById(id))();
  });

  showResultModel = signal(false);
  isFinished = computed(() => this.experiment() ? this.experiment()!.experimentStatus === ProjectStatus.FINISHED : false);

  mappedStatus = computed(() => {
    if (!this.experiment()) {
      return undefined;
    }
    return projectStatusToBadgeStatus(this.experiment()!.experimentStatus!);
  })

  trainableApps = computed(() => this.wths.containsTrainableApps(this.selectedWorkflow()));
  dispatchWorkflow$ = effect(() => {
    if (this.project() && this.project()!.workflowId) {
      this.store.dispatch(WorkflowActions.loadWorkflow({id: this.project()!.workflowId!}));
    }
  });

  start(): void {
    const experimentId = this.experiment()?.id;
    const projectId = this.projectId();
    if (!experimentId || !projectId) {
      return;
    }
    this.store.dispatch(ProjectFederatedExperimentsActions.startExperiment({
      projectId: projectId!,
      experimentId: experimentId!
    }));
  }

  stop(): void {
    const experimentId = this.experiment()?.id;
    const projectId = this.projectId();
    if (!experimentId || !projectId) {
      return;
    }
    this.store.dispatch(ProjectFederatedExperimentsActions.stopExperiment({
      projectId: projectId!,
      experimentId: experimentId!
    }));
  }

  reload(): void {
    const experimentId = this.experiment()?.id;
    const projectId = this.projectId();
    if (!experimentId || !projectId) {
      return;
    }
    this.store.dispatch(ProjectFederatedExperimentsActions.loadExperiment({
      projectId: projectId!,
      id: experimentId!
    }));
  }

  viewModel(): void {
    this.showResultModel.set(true);
  }

  showDetail(node: WorkflowNodeDetailDTO): void {
    this.dialog.open(LocalExperimentStepDetailComponent, {
      width: '600px',
      height: '100%',
      position: {top: '0', right: '0'},
      data: node,
    });
  }

  protected readonly animate = animate;
  protected readonly projectStatusToBadgeStatus = projectStatusToBadgeStatus;
  protected readonly runStatusToBadgeStatus = runStatusToBadgeStatus;
}
