import {Component, input, OnDestroy, OnInit, output} from '@angular/core';
import {ProjectDetailDto} from "@global-app/project/dto/project";
import {WorkflowDTO} from "@shared-lib/modules/workflow/dto/workflow.dto";
import {MatInput, MatLabel} from "@angular/material/input";
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {TranslatePipe} from "@ngx-translate/core";
import {MatFormField} from "@angular/material/form-field";
import {Subject, takeUntil} from "rxjs";
import {CreateProjectLocalExperimentDTO} from "@global-app/project/dto/project-experiments";

@Component({
  selector: 'app-create-local-experiment',
  imports: [
    MatFormField,
    MatInput,
    MatLabel,
    ReactiveFormsModule,
    TranslatePipe
  ],
  templateUrl: './create-local-experiment.component.html',
  styleUrl: './create-local-experiment.component.scss'
})
export class CreateLocalExperimentComponent implements OnInit, OnDestroy {
  project = input.required<ProjectDetailDto>();
  workflow = input.required<WorkflowDTO>();

  isValid = output<boolean>();
  createDto = output<CreateProjectLocalExperimentDTO>();


  newExperimentForm = new FormGroup({
    name: new FormControl<string>('', [Validators.required]),
    description: new FormControl<string>('', [Validators.required]),
  });

  private destroy$ = new Subject<void>();

  ngOnInit() {
    this.newExperimentForm.statusChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.isValid.emit(this.newExperimentForm.valid);
      });

    this.newExperimentForm.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        const createDto: CreateProjectLocalExperimentDTO = {
          name: this.newExperimentForm.value.name || '',
          description: this.newExperimentForm.value.description || '',
        }
        this.createDto.emit(createDto);
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
