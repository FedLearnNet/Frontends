import {ChangeDetectionStrategy, Component, computed, effect, inject, input} from '@angular/core';
import {MatTableModule} from "@angular/material/table";
import {MatIconModule} from "@angular/material/icon";
import {MatButtonModule} from "@angular/material/button";
import {MatToolbarModule} from "@angular/material/toolbar";
import {RouterLink} from "@angular/router";
import {TranslatePipe} from "@ngx-translate/core";
import {Store} from "@ngrx/store";
import {MatDialog} from "@angular/material/dialog";
import {ComponentType} from "@angular/cdk/portal";
import {ProjectDetailDto} from "@global-app/project/dto/project";
import {WorkflowDTO} from "@shared-lib/modules/workflow/dto/workflow.dto";
import {StatusBadgeComponent} from "@shared-lib/components/status-badge/status-badge.component";
import {TimeBadgeComponent} from "@shared-lib/components/time-badge/time-badge.component";
import {projectStatusToBadgeStatus, runStatusToBadgeStatus} from "@shared-lib/utils/badge-status.helper";
import {ProjectRunDTO, ProjectRunKind} from "@global-app/project/dto/project-experiments";
import {ProjectRunsActions} from "@global-app/project/store/project-runs.actions";
import {selectRunsOf} from "@global-app/project/store/project-runs.selectors";
import {
  CreateFederatedExperimentComponent
} from "@global-app/project/components/runs/create-federated-experiment/create-federated-experiment.component";
import {
  CreateLocalExperimentDialogComponent
} from "@global-app/project/components/runs/create-local-experiment-dialog/create-local-experiment-dialog.component";

/** The trainings of a project, on the platform or across clinics. */
@Component({
  selector: 'app-list-project-runs',
  imports: [
    MatTableModule,
    MatIconModule,
    MatButtonModule,
    MatToolbarModule,
    RouterLink,
    TranslatePipe,
    StatusBadgeComponent,
    TimeBadgeComponent
  ],
  templateUrl: './list-project-runs.component.html',
  styleUrl: './list-project-runs.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListProjectRunsComponent {
  private readonly store: Store = inject(Store);
  private readonly dialog: MatDialog = inject(MatDialog);

  project = input.required<ProjectDetailDto>();
  workflow = input.required<WorkflowDTO>();
  kind = input.required<ProjectRunKind>();

  public displayedColumns: string[] = ['name', 'description', 'status', 'createdAt'];

  runs = computed(() => this.store.selectSignal(selectRunsOf(this.project().id, this.kind()))());

  dispatchRuns$ = effect(() => this.store.dispatch(ProjectRunsActions.loadList({projectId: this.project().id, kind: this.kind()})));

  newRun(): void {
    const dialog: ComponentType<unknown> = this.kind() === 'local' ? CreateLocalExperimentDialogComponent : CreateFederatedExperimentComponent;
    this.dialog.open(dialog, {
      height: '80vh',
      width: '90vw',
      maxWidth: '100vw',
      autoFocus: false,
      data: {
        project: this.project(),
        workflow: this.workflow(),
        kind: this.kind()
      }
    });
  }

  // A training across clinics goes through accepting and preparing first, its experiment tells.
  statusOf(run: ProjectRunDTO): {text: string, type: ReturnType<typeof runStatusToBadgeStatus>} {
    const accepting = run.experiment?.status;
    return accepting
      ? {text: accepting, type: projectStatusToBadgeStatus(accepting)}
      : {text: run.status, type: runStatusToBadgeStatus(run.status)};
  }
}
