import {
  AfterViewInit,
  ChangeDetectionStrategy, ChangeDetectorRef,
  Component,
  inject,
  Input,
  OnInit,
  QueryList,
  ViewChildren
} from '@angular/core';
import {
  AppRunHyperparameterComponent
} from "../../app-runs/components/app-run-hyperparameter/app-run-hyperparameter.component";
import {MatButton, MatButtonModule} from "@angular/material/button";
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle
} from "@angular/material/dialog";
import {ControllerSocketService} from "../../../service/testembed-socket.service";
import {AppDetailDto} from "@global-app/app-store/dto/app-detail";
import {TestRunCreateDTO} from "../../../dto/test-run";
import {CommonModule} from "@angular/common";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatInputModule} from "@angular/material/input";
import {FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {CreateExperimentDetailDTO} from "../../../dto/experiment";
import {MatIcon, MatIconModule} from "@angular/material/icon";
import {MatTooltipModule} from "@angular/material/tooltip";
import {MatSelectModule} from "@angular/material/select";
import {versionValidator} from "../../../helper/validator";
import {MatDividerModule} from "@angular/material/divider";
import {ExperimentService} from "../../../service/experiment-run.service";
import {startWith} from "rxjs/operators";
import {map, Observable} from "rxjs";
import {MatAutocomplete, MatAutocompleteModule} from "@angular/material/autocomplete";


interface ExperimentCreateDialogData {
  app: AppDetailDto;
  datafiles: string[];
}

@Component({
  selector: 'app-experiment-create-dialog',
  standalone: true,
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
    MatInputModule,
    MatTooltipModule,
    MatButtonModule,
    MatSelectModule,
    MatDividerModule,
    MatAutocompleteModule
  ],
  templateUrl: './experiment-create-dialog.component.html',
  styleUrl: './experiment-create-dialog.component.scss',
})
export class ExperimentCreateDialogComponent implements OnInit {
  private readonly controllerSocketService: ControllerSocketService = inject(ControllerSocketService);
  private readonly experimentService: ExperimentService = inject(ExperimentService);
  readonly dialogRef = inject(MatDialogRef<ExperimentCreateDialogComponent>);
  readonly data = inject<ExperimentCreateDialogData>(MAT_DIALOG_DATA);

  public datafiles: string[] = [];
  filteredOptions: Observable<string[]>;

  experimentRunControl = new FormGroup({
    name: new FormControl<string>('', [Validators.required]),
    description: new FormControl<string>('', [Validators.required]),
    tuningMethod: new FormControl<string>('', []),
  });

  dynamicHyperparamsExperiment: { [key: string]: any[] } = {};

  hyperParamsValid: boolean = false;

  ngOnInit() {
    this.datafiles = this.data.datafiles;
    this.getInputs().forEach((input) => {
      const control = new FormControl<string>('', [Validators.required]);
      this.experimentRunControl.addControl(input as keyof typeof this.experimentRunControl.controls, control);
      this.setupValueChanges(control);
    });
  }

  getFormControl(name: string): FormControl {
    return this.experimentRunControl.get(name) as FormControl;
  }

  setupValueChanges(control: FormControl) {
    this.filteredOptions = control.valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value || '')),
    );
  }

  onMultiHyperParamsChanged(hyperparams: { [key: string]: any[] }) {
    this.dynamicHyperparamsExperiment = hyperparams
  }

  isValid(): boolean {
    return this.experimentRunControl.valid
      && Object.keys(this.dynamicHyperparamsExperiment).length > 0
      && this.hyperParamsValid;
  }

  onRunClick(): void {
    if (this.experimentRunControl.invalid) {
      return;
    }
    const name = this.experimentRunControl.get('name')!.value;
    const description = this.experimentRunControl.get('description')!.value;
    const inputFilePaths: { [key: string]: string[] } = {};
    this.getInputs().forEach((input) => {
      inputFilePaths[input] = this.experimentRunControl.get(input)!.value;
    });
    const create: CreateExperimentDetailDTO = {
      hyperParams: this.dynamicHyperparamsExperiment,
      federatedAppVersionId: this.data.app.latestVersionId,
      name: name!,
      description: description!,
      inputFilePaths: inputFilePaths!,
    }
    this.experimentService.createExperiment(this.data.app.id, create).subscribe((experiment) => {
      this.controllerSocketService.notifyStartExperiment();
      this.dialogRef.close(experiment);
    });
  }

  onNoClick(): void {
    this.dialogRef.close();
  }


  getInputs(): string[] {
    return this.data.app.appConfig.input.map((input) => input.variableName ?? input.name);
  }


  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();

    return this.datafiles.filter(option => option.toLowerCase().includes(filterValue));
  }
}
