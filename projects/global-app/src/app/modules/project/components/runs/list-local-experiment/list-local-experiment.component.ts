import {ChangeDetectionStrategy, Component, computed, effect, inject, input} from '@angular/core';

import {MatButtonModule} from "@angular/material/button";
import {MatTableModule} from "@angular/material/table";
import {MatIconModule} from "@angular/material/icon";
import {MatMenuModule} from "@angular/material/menu";
import {MatToolbarModule} from "@angular/material/toolbar";
import {MatDialog} from "@angular/material/dialog";
import {ProjectDetailDto} from "@global-app/project/dto/project";
import {RouterLink} from "@angular/router";
import {TranslatePipe} from "@ngx-translate/core";
import {Store} from "@ngrx/store";
import {ProjectLocalExperimentsActions} from "@global-app/project/store/project-local-experiments.actions";
import {
  CreateLocalExperimentDialogComponent
} from "@global-app/project/components/runs/create-local-experiment-dialog/create-local-experiment-dialog.component";
import {selectExperiments} from "@global-app/project/store/project-local-experiments.selectors";
import {WorkflowDTO} from "@shared-lib/modules/workflow/dto/workflow.dto";
import {StatusBadgeComponent} from "@shared-lib/components/status-badge/status-badge.component";
import {projectStatusToBadgeStatus} from "@shared-lib/utils/badge-status.helper";
import {TimeBadgeComponent} from "@shared-lib/components/time-badge/time-badge.component";

@Component({
  selector: 'app-list-local-experiment',
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
  templateUrl: './list-local-experiment.component.html',
  styleUrl: './list-local-experiment.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListLocalExperimentComponent {
  private readonly store: Store = inject(Store);
  private readonly dialog: MatDialog = inject(MatDialog);

  project = input.required<ProjectDetailDto>();
  workflow = input.required<WorkflowDTO>();

  public displayedColumns: string[] = ['name', 'description', 'status', 'createdAt'];

  public experiments = this.store.selectSignal(selectExperiments);

  public filteredExperiments = computed(() => {
    const experiments = this.experiments();
    const projectId = this.project().id;
    return experiments.filter(experiment => experiment.projectId === projectId);
  })

  dispatchExperiments$ = effect(() => this.store.dispatch(ProjectLocalExperimentsActions.loadList({projectId: this.project().id})));


  newExperiment(): void {
    this.dialog.open(CreateLocalExperimentDialogComponent, {
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
