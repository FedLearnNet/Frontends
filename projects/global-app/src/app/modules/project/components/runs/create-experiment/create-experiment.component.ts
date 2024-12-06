import {ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnInit} from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogActions, MatDialogClose,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle
} from "@angular/material/dialog";
import {ProjectDetailDto} from "@global-app/project/dto/project";
import {MatFormField, MatFormFieldModule, MatLabel} from "@angular/material/form-field";
import {MatInput, MatInputModule} from "@angular/material/input";
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {ProjectExperimentService} from "@global-app/project/services/project-experiment-service";
import {
  ProjectFederatedCreateExperimentDTO,
  ProjectLocalCreateExperimentDTO
} from "@global-app/project/dto/project-experiments";
import {MatCheckboxModule} from "@angular/material/checkbox";
import {MatButtonModule} from "@angular/material/button";

export interface CreateExperimentData {
  project: ProjectDetailDto;
  forFederated: boolean;
}

@Component({
  selector: 'app-create-experiment',
  standalone: true,
  imports: [MatDialogTitle,
    MatDialogContent,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
    ReactiveFormsModule,
    MatDialogActions,
    MatButtonModule, MatDialogClose],
  templateUrl: './create-experiment.component.html',
  styleUrl: './create-experiment.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CreateExperimentComponent implements OnInit {
  private readonly dialogRef: MatDialogRef<CreateExperimentComponent> = inject(MatDialogRef);
  private readonly cdr: ChangeDetectorRef = inject(ChangeDetectorRef);
  private readonly projectExperimentService: ProjectExperimentService = inject(ProjectExperimentService);
  readonly data = inject<CreateExperimentData>(MAT_DIALOG_DATA);

  newExperimentForm = new FormGroup({
    name: new FormControl<string>('', [Validators.required]),
    description: new FormControl<string>('', [Validators.required]),
    acceptProcess: new FormControl<boolean>(false, [Validators.requiredTrue])
  });

  ngOnInit() {
    this.cdr.detectChanges();
  }

  isValidProject(): boolean {
    return !!(this.data.project && this.data.project.id && this.data.project.name && this.data.project.description &&
      this.data.project.dataTypeIds.length > 1 && this.data.project.queryId);
  }

  onSubmit(): void {
    if(!this.isValidProject()){
      return;
    }
    if (this.data.forFederated) {
      this.onSubmitFederated();
    } else {
      this.onSubmitLocal();
    }
  }

  onSubmitFederated(): void {
    if (this.newExperimentForm.valid) {
      console.log(this.newExperimentForm.value);
      const createDto: ProjectFederatedCreateExperimentDTO = {
        name: this.newExperimentForm.value.name || '',
        description: this.newExperimentForm.value.description || '',
      }
      this.projectExperimentService.createFederatedExperiment(this.data.project.id, createDto).subscribe((newExperiment) => {
        this.dialogRef.close(newExperiment);
      });
    } else {
      this.cdr.detectChanges();
    }
  }

  onSubmitLocal(): void {
    if (this.newExperimentForm.valid) {
      console.log(this.newExperimentForm.value);
      const createDto: ProjectLocalCreateExperimentDTO = {
        name: this.newExperimentForm.value.name || '',
        description: this.newExperimentForm.value.description || '',
      }
      this.projectExperimentService.createLocalExperiment(this.data.project.id, createDto).subscribe((newExperiment) => {
        this.dialogRef.close(newExperiment);
      });
    } else {
      this.cdr.detectChanges();
    }
  }
}
