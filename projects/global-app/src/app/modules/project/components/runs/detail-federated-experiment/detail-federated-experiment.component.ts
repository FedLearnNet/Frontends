import {ChangeDetectionStrategy, Component, computed, effect, inject, signal} from '@angular/core';
import {ProjectStatus} from "@global-app/project/dto/project";
import {MatIconModule} from "@angular/material/icon";
import {StatusBadgeComponent} from "@shared-lib/components/status-badge/status-badge.component";
import {projectStatusToBadgeStatus, runStatusToBadgeStatus} from "@shared-lib/utils/badge-status.helper";
import {
  ModelVersionDetailViewComponent
} from "@global-app/model-store/components/model-version-detail-view/model-version-detail-view.component";
import {selectSelectedProject} from "@global-app/project/store/project.selectors";
import {Action, Store} from "@ngrx/store";
import {ProjectRunKind} from "@global-app/project/dto/project-experiments";
import {selectError, selectLoading, selectSelectedRun} from "@global-app/project/store/project-runs.selectors";
import {ProjectRunsActions} from "@global-app/project/store/project-runs.actions";
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
import {TranslatePipe} from "@ngx-translate/core";

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
    TranslatePipe,
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

  run = this.store.selectSignal(selectSelectedRun);
  error = this.store.selectSignal(selectError);
  selectedWorkflow = this.store.selectSignal(selectSelectedWorkflow);
  loading = this.store.selectSignal(selectLoading);

  showResultModel = signal(false);
  isFinished = computed(() => this.run()?.experiment?.status === ProjectStatus.FINISHED);

  trainableApps = computed(() => this.wths.containsTrainableApps(this.selectedWorkflow()));

  // The training runs a copy of the project's workflow, its steps name the nodes of that copy.
  dispatchWorkflow$ = effect(() => {
    const workflowId = this.run()?.experiment?.workflowId ?? this.project()?.workflowId;
    if (workflowId) {
      this.store.dispatch(WorkflowActions.loadWorkflow({id: workflowId}));
    }
  });

  start(): void {
    this.dispatch(ProjectRunsActions.start);
  }

  stop(): void {
    this.dispatch(ProjectRunsActions.stop);
  }

  reload(): void {
    this.dispatch(ProjectRunsActions.follow);
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

  private dispatch(action: (props: { projectId: number; kind: ProjectRunKind; runId: number }) => Action): void {
    const runId = this.run()?.id;
    const projectId = this.project()?.id;
    if (runId && projectId) {
      this.store.dispatch(action({projectId, kind: 'federated', runId}));
    }
  }

  protected readonly projectStatusToBadgeStatus = projectStatusToBadgeStatus;
  protected readonly runStatusToBadgeStatus = runStatusToBadgeStatus;
}
