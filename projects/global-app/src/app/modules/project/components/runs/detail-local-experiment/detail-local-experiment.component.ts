import {Component, computed, effect, inject} from '@angular/core';
import {Store} from "@ngrx/store";
import {selectSelectedProject} from "@global-app/project/store/project.selectors";
import {
  selectConnectedById,
  selectLoading,
  selectSelectedExperiment
} from "@global-app/project/store/project-local-experiments.selectors";
import {MatDialog} from "@angular/material/dialog";
import {selectSelectedWorkflow} from "@shared-lib/modules/workflow/store/workflow.selectors";
import * as WorkflowActions from "@shared-lib/modules/workflow/store/workflow.actions";
import {
  WorkflowReadonlyViewComponent
} from "@shared-lib/modules/workflow/components/workflow-readonly-view/workflow-readonly-view.component";
import {WorkflowNodeDetailDTO} from "@shared-lib/modules/workflow/dto/workflow.dto";
import {
  LocalExperimentStepDetailComponent
} from "@global-app/project/components/runs/local-experiment-step-detail/local-experiment-step-detail.component";
import {
  ExperimentHeaderComponent
} from "@global-app/project/components/runs/experiment-header/experiment-header.component";
import {ProjectLocalExperimentsActions} from "@global-app/project/store/project-local-experiments.actions";
import {SkeletonLoaderComponent} from "@shared-lib/components/skeleton-loader/skeleton-loader.component";

@Component({
  selector: 'app-detail-local-experiment',
  imports: [
    WorkflowReadonlyViewComponent,
    ExperimentHeaderComponent,
    SkeletonLoaderComponent
  ],
  templateUrl: './detail-local-experiment.component.html',
  styleUrl: './detail-local-experiment.component.scss'
})
export class DetailLocalExperimentComponent {
  private readonly store: Store = inject(Store);
  private readonly dialog: MatDialog = inject(MatDialog);

  project = this.store.selectSignal(selectSelectedProject);
  experiment = this.store.selectSignal(selectSelectedExperiment);
  selectedWorkflow = this.store.selectSignal(selectSelectedWorkflow);
  loading = this.store.selectSignal(selectLoading);

  private readonly projectId = computed(() => this.project()?.id ?? null);

  connected = computed(() => {
    const id = this.projectId();
    if (!id) return false;
    return this.store.selectSignal(selectConnectedById(id))();
  });

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
    this.store.dispatch(ProjectLocalExperimentsActions.startLocalExperiment({
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
    this.store.dispatch(ProjectLocalExperimentsActions.stopLocalExperiment({
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
    this.store.dispatch(ProjectLocalExperimentsActions.loadExperiment({
      projectId: projectId!,
      id: experimentId!
    }));
  }

  showDetail(node: WorkflowNodeDetailDTO): void {
    this.dialog.open(LocalExperimentStepDetailComponent, {
      width: '600px',
      height: '100%',
      position: {top: '0', right: '0'},
      data: node,
    });
  }
}
