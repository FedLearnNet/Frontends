import {ChangeDetectionStrategy, Component, inject} from '@angular/core';
import {MatTabChangeEvent, MatTabsModule} from "@angular/material/tabs";
import {TranslatePipe} from "@ngx-translate/core";
import {TrainingUsedDataComponent} from "../training-used-data/training-used-data.component";
import {Store} from "@ngrx/store";
import {
  selectConnectedDetail,
  selectError,
  selectLoading,
  selectSelectedDetail
} from "../../store/federated-learning-project.selectors";
import {selectSelectedWorkflow, selectWorkflowLoading} from "@shared-lib/modules/workflow/store/workflow.selectors";
import {SkeletonLoaderComponent} from "@shared-lib/components/skeleton-loader/skeleton-loader.component";
import {
  WorkflowReadonlyViewComponent
} from "@shared-lib/modules/workflow/components/workflow-readonly-view/workflow-readonly-view.component";
import {WorkflowNodeDetailDTO} from "@shared-lib/modules/workflow/dto/workflow.dto";
import {MatDialog} from "@angular/material/dialog";
import {loadWorkflow} from "@shared-lib/modules/workflow/store/workflow.actions";
import {
  ExperimentHeaderComponent
} from "@global-app/project/components/runs/experiment-header/experiment-header.component";
import {FederatedLearningProjectActions} from "../../store/federated-learning-project.actions";
import {StatusBadgeComponent} from "@shared-lib/components/status-badge/status-badge.component";
import {TrainingStepDetailComponent} from "../training-step-detail/training-step-detail.component";
import {ErrorCardComponent} from "@shared-lib/components/error-card/error-card.component";
import {MatButton} from "@angular/material/button";
import {MatIcon} from "@angular/material/icon";

@Component({
  selector: 'app-training-detail',
  templateUrl: './training-detail.component.html',
  styleUrl: './training-detail.component.scss',
  imports: [
    MatTabsModule,
    TranslatePipe,
    TrainingUsedDataComponent,
    SkeletonLoaderComponent,
    WorkflowReadonlyViewComponent,
    ExperimentHeaderComponent,
    StatusBadgeComponent,
    ErrorCardComponent,
    MatButton,
    MatIcon
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class TrainingDetailComponent {
  private readonly store: Store = inject(Store);
  private readonly dialog: MatDialog = inject(MatDialog);

  flProject = this.store.selectSignal(selectSelectedDetail);
  selectedWorkflow = this.store.selectSignal(selectSelectedWorkflow);
  selectedWorkflowLoading = this.store.selectSignal(selectWorkflowLoading);
  loading = this.store.selectSignal(selectLoading);
  connected = this.store.selectSignal(selectConnectedDetail);
  error = this.store.selectSignal(selectError);


  selectedTabIndex: number = 0;


  onTabChange(evt: MatTabChangeEvent) {
    const label = evt.tab.textLabel?.trim().toLowerCase();
    if (label === 'workflow') {
      this.loadWorkflow();
    }
  }

  loadWorkflow() {
    if (this.flProject() && this.flProject()!.project.workflowId && !this.selectedWorkflow()) {
      this.store.dispatch(loadWorkflow({id: this.flProject()!.project.workflowId!}))
    }
  }

  reload() {
    this.store.dispatch(FederatedLearningProjectActions.loadDetail({id: this.flProject()!.project.id}));
  }

  exportPatientData() {
    this.store.dispatch(FederatedLearningProjectActions.exportPatients({id: this.flProject()!.project.id}));
  }

  showDetail(node: WorkflowNodeDetailDTO): void {
    this.dialog.open(TrainingStepDetailComponent, {
      width: '600px',
      height: '100%',
      position: {top: '0', right: '0'},
      data: node,
    });
  }
}
