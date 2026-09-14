import {Component, inject, signal} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogActions, MatDialogContent, MatDialogRef} from "@angular/material/dialog";
import {MatButton} from "@angular/material/button";
import {TranslatePipe} from "@ngx-translate/core";
import {ProjectDetailDto} from "@global-app/project/dto/project";
import {WorkflowDTO} from "@shared-lib/modules/workflow/dto/workflow.dto";
import {
  CreateLocalExperimentComponent
} from "@global-app/project/components/runs/create-local-experiment/create-local-experiment.component";
import {CreateProjectLocalExperimentDTO} from "@global-app/project/dto/project-experiments";
import {Store} from "@ngrx/store";
import {ProjectLocalExperimentsActions} from "@global-app/project/store/project-local-experiments.actions";
import {
  CloseableDialogTitleComponent
} from "@shared-lib/components/closeable-dialog-title/closeable-dialog-title.component";


interface LocalExperimentData {
  project: ProjectDetailDto,
  workflow: WorkflowDTO
}

@Component({
  selector: 'app-create-local-experiment-dialog',
  imports: [
    MatDialogContent,
    MatButton,
    MatDialogActions,
    TranslatePipe,
    CreateLocalExperimentComponent,
    CloseableDialogTitleComponent
  ],
  templateUrl: './create-local-experiment-dialog.component.html',
  styleUrl: './create-local-experiment-dialog.component.scss'
})
export class CreateLocalExperimentDialogComponent {
  private readonly dialogRef: MatDialogRef<CreateLocalExperimentDialogComponent> = inject(MatDialogRef);
  private readonly store: Store = inject(Store);
  readonly data = inject<LocalExperimentData>(MAT_DIALOG_DATA);

  isValidForm = signal<boolean>(false);
  createDto = signal<CreateProjectLocalExperimentDTO | undefined>(undefined);

  onSubmit(): void {
    const createDto = this.createDto();
    if (!this.isValidForm() && createDto) {
      return;
    }
    this.store.dispatch(ProjectLocalExperimentsActions.create({
      projectId: this.data.project.id,
      dto: createDto!,
    }));
    this.dialogRef.close();
  }

  toggleMaximize(isMaximized: boolean): void {
    if (isMaximized) {
      this.dialogRef.updateSize('100vw', '100vh');
    } else {
      this.dialogRef.updateSize('90vw', '80vh');
    }
  }
}
