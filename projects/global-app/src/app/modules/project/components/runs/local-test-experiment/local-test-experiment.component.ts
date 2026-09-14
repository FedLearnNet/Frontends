import {ChangeDetectionStrategy, Component, effect, inject, input} from '@angular/core';
import {Store} from "@ngrx/store";
import {ProjectDetailDto} from "@global-app/project/dto/project";
import {WorkflowDTO, WorkflowNodeDetailDTO} from "@shared-lib/modules/workflow/dto/workflow.dto";
import {
  selectConnectedTestExperiment,
  selectLoading,
  selectTestExperiment
} from "@global-app/project/store/project-local-experiments.selectors";
import {ProjectLocalExperimentsActions} from "@global-app/project/store/project-local-experiments.actions";
import {TranslatePipe} from "@ngx-translate/core";
import {
  WorkflowReadonlyViewComponent
} from "@shared-lib/modules/workflow/components/workflow-readonly-view/workflow-readonly-view.component";
import {
  LocalExperimentStepDetailComponent
} from "@global-app/project/components/runs/local-experiment-step-detail/local-experiment-step-detail.component";
import {MatDialog} from "@angular/material/dialog";
import {
  ExperimentHeaderComponent
} from "@global-app/project/components/runs/experiment-header/experiment-header.component";
import {MatFabButton} from "@angular/material/button";
import {EmptyStateComponent} from "@shared-lib/modules/app-execution/components/empty-state/empty-state.component";

@Component({
  selector: 'app-local-test-experiment',
  imports: [
    TranslatePipe,
    WorkflowReadonlyViewComponent,
    ExperimentHeaderComponent,
    MatFabButton,
    EmptyStateComponent
  ],
  templateUrl: './local-test-experiment.component.html',
  styleUrl: './local-test-experiment.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LocalTestExperimentComponent {
  private readonly store: Store = inject(Store);
  private readonly dialog: MatDialog = inject(MatDialog);

  project = input.required<ProjectDetailDto>();
  workflow = input.required<WorkflowDTO>();

  public experiment = this.store.selectSignal(selectTestExperiment);
  loading = this.store.selectSignal(selectLoading);
  connected = this.store.selectSignal(selectConnectedTestExperiment);

  dispatchExperiment$ = effect(() => this.reload());

  reload(): void {
    this.store.dispatch(ProjectLocalExperimentsActions.loadExperimentTest({projectId: this.project().id}));
  }

  newExperiment(): void {
    this.store.dispatch(ProjectLocalExperimentsActions.createTest({
      projectId: this.project().id
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
