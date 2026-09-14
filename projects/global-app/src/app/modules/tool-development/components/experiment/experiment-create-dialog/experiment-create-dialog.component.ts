import {CommonModule} from '@angular/common';
import {Component, computed, inject, signal} from '@angular/core';
import {toSignal} from '@angular/core/rxjs-interop';
import {FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {MatButtonModule} from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle
} from '@angular/material/dialog';
import {MatDividerModule} from '@angular/material/divider';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {MatTooltipModule} from '@angular/material/tooltip';
import {map, startWith} from 'rxjs';

import {
  AppRunHyperparameterComponent
} from '@shared-lib/modules/app-execution/components/app-run-hyperparameter/app-run-hyperparameter.component';
import {CreateExperimentDetailDTO} from '@shared-lib/modules/app-execution/dto/experiment';
import {AppDetailDto} from '@shared-lib/modules/store/dto/app-detail';
import {TranslatePipe} from '@ngx-translate/core';

import {ControllerSocketService} from '../../../service/testembed-socket.service';
import {ExperimentService} from '../../../service/experiment-run.service';
import {HintCardComponent} from "@shared-lib/components/hint-card/hint-card.component";
import {ErrorCardComponent} from "@shared-lib/components/error-card/error-card.component";

interface ExperimentCreateDialogData {
  app: AppDetailDto;
  datafiles: string[];
}

@Component({
  selector: 'app-experiment-create-dialog',
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    AppRunHyperparameterComponent,
    MatIconModule,
    ReactiveFormsModule,
    MatTooltipModule,
    MatButtonModule,
    MatSelectModule,
    MatDividerModule,
    MatAutocompleteModule,
    TranslatePipe,
    HintCardComponent,
    ErrorCardComponent,
  ],
  templateUrl: './experiment-create-dialog.component.html',
  styleUrl: './experiment-create-dialog.component.scss'
})
export class ExperimentCreateDialogComponent {
  private readonly controllerSocketService = inject(ControllerSocketService);
  private readonly experimentService = inject(ExperimentService);
  readonly dialogRef = inject(MatDialogRef<ExperimentCreateDialogComponent>);
  readonly data = inject<ExperimentCreateDialogData>(MAT_DIALOG_DATA);

  get hasHyperparameter(): boolean {
    const hp = this.data.app.appConfig?.hyperparams;
    return Array.isArray(hp) && hp.length > 0;
  }

  readonly datafiles = signal<string[]>(this.data.datafiles ?? []);

  readonly experimentRunControl = new FormGroup({
    name: new FormControl<string>('', {nonNullable: true, validators: [Validators.required]}),
    description: new FormControl<string>('', {nonNullable: true, validators: [Validators.required]}),
    //tuningMethod: new FormControl<string>('', {nonNullable: true}),
  });

  readonly dynamicHyperparamsExperiment = signal<{ [key: string]: any[] }>({});
  readonly hyperParamsValid = signal<boolean>(!this.hasHyperparameter);

  readonly inputs = computed<string[]>(() =>
    (this.data.app.appConfig?.input ?? []).map(i => i.variableName ?? i.name)
  );


  private readonly filteredOptionsByInput = new Map<string, () => string[]>();

  isValid() {
    return this.experimentRunControl.valid &&
      this.hyperParamsValid()
  }

  constructor() {
    for (const input of this.inputs()) {
      this.ensureInputControl(input);
    }
  }

  getFormControl(name: string): FormControl<string> {
    return this.experimentRunControl.get(name) as FormControl<string>;
  }

  getFilteredOptionsSignal(input: string): () => string[] {
    this.ensureInputControl(input);
    return this.filteredOptionsByInput.get(input)!;
  }

  onMultiHyperParamsChanged(hyperparams: { [key: string]: any[] }) {
    this.dynamicHyperparamsExperiment.set(hyperparams ?? {});
  }

  onFormsValid(valid: boolean) {
    this.hyperParamsValid.set(!!valid);
  }

  onRunClick(): void {
    if (this.experimentRunControl.invalid) return;

    const inputFilePaths: { [key: string]: string[] } = {};
    for (const input of this.inputs()) {
      inputFilePaths[input] = this.getFormControl(input).value as any;
    }

    const create: CreateExperimentDetailDTO = {
      hyperParams: this.dynamicHyperparamsExperiment(),
      federatedAppVersionId: this.data.app.latestVersionId,
      name: this.experimentRunControl.controls.name.value,
      description: this.experimentRunControl.controls.description.value,
      inputFilePaths,
    };

    this.experimentService.createExperiment(this.data.app.id, create).subscribe(experiment => {
      this.controllerSocketService.notifyStartExperiment();
      this.dialogRef.close(experiment);
    });
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  private ensureInputControl(input: string) {
    if (!this.experimentRunControl.contains(input)) {
      const control = new FormControl<string>('', {nonNullable: true, validators: [Validators.required]});
      (this.experimentRunControl as FormGroup).addControl(input, control);
    }

    if (!this.filteredOptionsByInput.has(input)) {
      const c = this.getFormControl(input);

      const optionsSig = toSignal(
        c.valueChanges.pipe(
          startWith(c.value ?? ''),
          map(v => this.filter(v ?? '')),
        ),
        {initialValue: this.filter(c.value ?? '')}
      );

      this.filteredOptionsByInput.set(input, optionsSig);
    }
  }

  private filter(value: string): string[] {
    const filterValue = (value ?? '').toLowerCase();
    return this.datafiles().filter(option => option.toLowerCase().includes(filterValue));
  }


  get formErrors() {
    const errors: string[] = [];
    if (this.experimentRunControl.invalid) {
      const missingRequired: string[] = [];
      for (const [key, ctrl] of Object.entries(this.experimentRunControl.controls)) {
        if (ctrl.hasError?.('required')) missingRequired.push(key);
      }

      errors.push(
        missingRequired.length
          ? `Missing required fields: ${missingRequired.join(', ')}`
          : 'Form is invalid. Please check the highlighted fields.'
      );
    }

    if (!this.hyperParamsValid()) {
      errors.push('Hyperparameters are invalid. Please fix validation errors in the hyperparameter section.');
    }

    return errors;
  }
}
