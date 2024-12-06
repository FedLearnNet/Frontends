import {ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnInit} from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogActions, MatDialogClose,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle
} from "@angular/material/dialog";
import {ProjectExperimentService} from "@global-app/project/services/project-experiment-service";
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {CreateExperimentData} from "@global-app/project/components/runs/create-experiment/create-experiment.component";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatInputModule} from "@angular/material/input";
import {MatCheckboxModule} from "@angular/material/checkbox";
import {MatButtonModule} from "@angular/material/button";
import {ProjectService} from "@global-app/project/services/project-service";
import {ProjectFederatedCreateExperimentDTO} from "@global-app/project/dto/project-experiments";
import {ProjectCreateDto} from "@global-app/project/dto/project";
import {MatDivider} from "@angular/material/divider";
import {SelectQueryComponent} from "@global-app/find-data/components/select-query/select-query.component";

@Component({
  selector: 'app-create-project',
  standalone: true,
  imports: [MatDialogTitle,
    MatDialogContent,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
    ReactiveFormsModule,
    MatDialogActions,
    MatButtonModule, MatDialogClose, MatDivider, SelectQueryComponent],
  templateUrl: './create-project.component.html',
  styleUrl: './create-project.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CreateProjectComponent implements OnInit {
  private readonly dialogRef: MatDialogRef<CreateProjectComponent> = inject(MatDialogRef);
  private readonly cdr: ChangeDetectorRef = inject(ChangeDetectorRef);
  private readonly projectService: ProjectService = inject(ProjectService);

  newExperimentForm = new FormGroup({
    name: new FormControl<string>('', [Validators.required]),
    description: new FormControl<string>('', [Validators.required]),
    acceptProcess: new FormControl<boolean>(false, [Validators.requiredTrue])
  });

  queryId?: number;

  ngOnInit() {
    this.cdr.detectChanges();
  }


  onSubmit(): void {
    if (this.newExperimentForm.valid) {
      console.log(this.newExperimentForm.value);
      const createDto: ProjectCreateDto = {
        name: this.newExperimentForm.value.name || '',
        description: this.newExperimentForm.value.description || '',
        queryId: this.queryId
      }
      this.projectService.createProject(createDto).subscribe((newExperiment) => {
        this.dialogRef.close(newExperiment);
      });
    } else {
      this.cdr.detectChanges();
    }
  }
}
