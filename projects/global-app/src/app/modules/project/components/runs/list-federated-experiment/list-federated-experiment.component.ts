import {ChangeDetectionStrategy, Component, effect, inject, input} from '@angular/core';

import {MatButtonModule} from "@angular/material/button";
import {MatTableModule} from "@angular/material/table";
import {MatIconModule} from "@angular/material/icon";
import {MatMenuModule} from "@angular/material/menu";
import {MatToolbarModule} from "@angular/material/toolbar";
import {ProjectDetailDto} from "@global-app/project/dto/project";
import {RouterLink} from "@angular/router";
import {MatDialog} from "@angular/material/dialog";
import {
  CreateFederatedExperimentComponent
} from "@global-app/project/components/runs/create-federated-experiment/create-federated-experiment.component";
import {TranslatePipe} from "@ngx-translate/core";
import {StatusBadgeComponent} from "@shared-lib/components/status-badge/status-badge.component";
import {projectStatusToBadgeStatus} from "@shared-lib/utils/badge-status.helper";
import {TimeBadgeComponent} from "@shared-lib/components/time-badge/time-badge.component";
import {Store} from "@ngrx/store";
import {selectExperiments} from "@global-app/project/store/project-federated-experiments.selectors";
import {ProjectFederatedExperimentsActions} from "@global-app/project/store/project-federated-experiments.actions";
import {WorkflowDTO} from "@shared-lib/modules/workflow/dto/workflow.dto";

@Component({
  selector: 'app-list-federated-experiment',
  imports: [
    MatTableModule,
    MatIconModule,
    MatMenuModule,
    MatButtonModule,
    MatToolbarModule,
    RouterLink,
    TranslatePipe,
    StatusBadgeComponent,
    TimeBadgeComponent
  ],
  templateUrl: './list-federated-experiment.component.html',
  styleUrl: './list-federated-experiment.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListFederatedExperimentComponent {
  private readonly store: Store = inject(Store);
  private readonly dialog: MatDialog = inject(MatDialog);

  project = input.required<ProjectDetailDto>();
  workflow = input.required<WorkflowDTO>();
  public experiments = this.store.selectSignal(selectExperiments);

  public displayedColumns: string[] = ['name', 'description', 'status', 'createdAt'];

  dispatchExperiments$ = effect(() => this.store.dispatch(ProjectFederatedExperimentsActions.loadList({projectId: this.project().id})));

  newExperiment(): void {
    this.dialog.open(CreateFederatedExperimentComponent, {
      height: '80vh',
      width: '90vw',
      maxWidth: '100vw',
      autoFocus: false,
      data: {
        project: this.project(),
        workflow: this.workflow()
      }
    });
  }


  protected readonly projectStatusToBadgeStatus = projectStatusToBadgeStatus;
}
