import {ChangeDetectionStrategy, Component, computed, effect, inject} from '@angular/core';
import {Action, Store} from "@ngrx/store";
import {ProjectRunKind} from "@global-app/project/dto/project-experiments";
import {selectSelectedProject} from "@global-app/project/store/project.selectors";
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
import {SkeletonLoaderComponent} from "@shared-lib/components/skeleton-loader/skeleton-loader.component";
import {ProjectRunsActions} from "@global-app/project/store/project-runs.actions";
import {selectConnectedById, selectLoading, selectSelectedRun} from "@global-app/project/store/project-runs.selectors";

/** A training of the project's workflow on the platform. */
@Component({
  selector: 'app-detail-local-experiment',
  imports: [
    WorkflowReadonlyViewComponent,
    ExperimentHeaderComponent,
    SkeletonLoaderComponent
  ],
  templateUrl: './detail-local-experiment.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './detail-local-experiment.component.scss'
})
export class DetailLocalExperimentComponent {
  private readonly store: Store = inject(Store);
  private readonly dialog: MatDialog = inject(MatDialog);

  project = this.store.selectSignal(selectSelectedProject);
  run = this.store.selectSignal(selectSelectedRun);
  selectedWorkflow = this.store.selectSignal(selectSelectedWorkflow);
  loading = this.store.selectSignal(selectLoading);

  connected = computed(() => {
    const id = this.run()?.id;
    return id ? this.store.selectSignal(selectConnectedById(id))() : false;
  });

  dispatchWorkflow$ = effect(() => {
    if (this.project()?.workflowId) {
      this.store.dispatch(WorkflowActions.loadWorkflow({id: this.project()!.workflowId!}));
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
      this.store.dispatch(action({projectId, kind: 'local', runId}));
    }
  }
}
