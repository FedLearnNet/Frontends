import {CommonModule} from '@angular/common';
import {ChangeDetectionStrategy, Component, DestroyRef, inject, OnInit, signal} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {FormControl, FormGroup, FormRecord, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {MatButtonModule} from '@angular/material/button';
import {MAT_DIALOG_DATA, MatDialogActions, MatDialogContent, MatDialogRef, MatDialogTitle} from '@angular/material/dialog';
import {MatDividerModule} from '@angular/material/divider';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {MatTooltipModule} from '@angular/material/tooltip';
import {finalize} from 'rxjs';
import {TranslatePipe} from '@ngx-translate/core';
import {AppRunHyperparameterComponent} from '@shared-lib/modules/app-execution/components/app-run-hyperparameter/app-run-hyperparameter.component';
import {CreateExperimentDetailDTO} from '@shared-lib/modules/app-execution/dto/experiment';
import {ToolInputConfigDTO} from '@shared-lib/modules/app-execution/dto/config';
import {AppDetailDto} from '@shared-lib/modules/store/dto/app-detail';
import {FileDTO} from '@shared-lib/modules/files/dto/file';
import {FileService} from '@shared-lib/modules/files/store/file.service';
import {UploadProgress} from '@shared-lib/modules/files/model/file-response';
import {UploadProgressComponent} from '@shared-lib/modules/files/components/upload-progress/upload-progress.component';
import {BytesPipe} from '@shared-lib/pipies/bytes.pipe';
import {HintCardComponent} from '@shared-lib/components/hint-card/hint-card.component';
import {ErrorCardComponent} from '@shared-lib/components/error-card/error-card.component';
import {ControllerSocketService} from '../../../service/testembed-socket.service';
import {ExperimentService} from '../../../service/experiment-run.service';

interface ExperimentCreateDialogData {
  app: AppDetailDto;
  datafiles: string[];
}

type InputSource = 'stored' | 'upload' | 'engine';
type InputValue = string | FileDTO | null;

@Component({
  selector: 'app-experiment-create-dialog',
  imports: [
    CommonModule, MatFormFieldModule, MatInputModule, FormsModule, MatDialogTitle,
    MatDialogContent, MatDialogActions, AppRunHyperparameterComponent, MatIconModule,
    ReactiveFormsModule, MatTooltipModule, MatButtonModule, MatSelectModule,
    MatDividerModule, MatAutocompleteModule, TranslatePipe, HintCardComponent,
    ErrorCardComponent, UploadProgressComponent, BytesPipe,
  ],
  templateUrl: './experiment-create-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './experiment-create-dialog.component.scss'
})
export class ExperimentCreateDialogComponent implements OnInit {
  private readonly controllerSocketService = inject(ControllerSocketService);
  private readonly experimentService = inject(ExperimentService);
  private readonly fileService = inject(FileService);
  private readonly destroyRef = inject(DestroyRef);
  readonly dialogRef = inject(MatDialogRef<ExperimentCreateDialogComponent>);
  readonly data = inject<ExperimentCreateDialogData>(MAT_DIALOG_DATA);

  readonly inputConfigs = this.data.app.appConfig?.input ?? [];
  readonly datafiles = this.data.datafiles ?? [];
  readonly files = signal<FileDTO[]>([]);
  readonly loadingFiles = signal(true);
  readonly fileListError = signal(false);
  readonly uploads = signal<Record<string, UploadProgress>>({});
  readonly starting = signal(false);
  readonly inputSources: Record<string, InputSource> = {};
  readonly inputControls = new FormRecord<FormControl<InputValue>>({});
  readonly experimentRunControl = new FormGroup({
    name: new FormControl('', {nonNullable: true, validators: [Validators.required]}),
    description: new FormControl('', {nonNullable: true, validators: [Validators.required]}),
  });
  readonly dynamicHyperparamsExperiment = signal<{ [key: string]: any[] }>({});
  readonly hyperParamsValid = signal(!this.hasHyperparameter);

  get hasHyperparameter(): boolean {
    return !!this.data.app.appConfig?.hyperparams?.length;
  }

  constructor() {
    for (const config of this.inputConfigs) {
      const key = this.variableOf(config);
      this.inputSources[key] = 'stored';
      this.inputControls.addControl(key, new FormControl<InputValue>(null,
        config.required ? [Validators.required] : []));
    }
  }

  ngOnInit(): void {
    this.loadFiles();
  }

  loadFiles(): void {
    this.loadingFiles.set(true);
    this.fileListError.set(false);
    this.fileService.listFiles().pipe(
      takeUntilDestroyed(this.destroyRef),
      finalize(() => this.loadingFiles.set(false)),
    ).subscribe({
      next: files => this.files.set(files),
      error: () => this.fileListError.set(true),
    });
  }

  variableOf(config: ToolInputConfigDTO): string {
    return config.variableName ?? config.name;
  }

  getFormControl(key: string): FormControl<InputValue> {
    return this.inputControls.controls[key];
  }

  setSource(key: string, source: InputSource): void {
    this.inputSources[key] = source;
    this.getFormControl(key).reset(null);
    this.uploads.update(uploads => {
      const next = {...uploads};
      delete next[key];
      return next;
    });
  }

  filteredPaths(key: string): string[] {
    const value = this.getFormControl(key).value;
    const filter = typeof value === 'string' ? value.toLowerCase() : '';
    return this.datafiles.filter(path => path.toLowerCase().includes(filter));
  }

  selectedFile(key: string): FileDTO | null {
    const value = this.getFormControl(key).value;
    return value && typeof value !== 'string' ? value : null;
  }

  uploadFile(key: string, event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file || this.starting() || this.uploads()[key]?.inProgress) return;
    this.getFormControl(key).reset(null);
    this.uploads.update(uploads => ({...uploads, [key]: {progress: 0, inProgress: true}}));
    this.fileService.upload(file).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: progress => {
        this.uploads.update(uploads => ({...uploads, [key]: progress}));
        if (progress.result) {
          this.files.update(files => [progress.result!, ...files.filter(f => f.id !== progress.result!.id)]);
          this.getFormControl(key).setValue(progress.result);
        }
      },
      error: () => this.uploads.update(uploads => ({...uploads, [key]: {
        progress: 0, inProgress: false, error: 'Upload failed. Please try again.',
      }})),
    });
  }

  isValid(): boolean {
    return this.experimentRunControl.valid && this.hyperParamsValid() && !this.starting() &&
      !Object.values(this.uploads()).some(upload => upload.inProgress) &&
      this.inputConfigs.every(config => {
        const value = this.getFormControl(this.variableOf(config)).value;
        if (value === null || value === '') return !config.required;
        return this.inputSources[this.variableOf(config)] === 'engine'
          ? typeof value === 'string' && !!value.trim()
          : typeof value !== 'string' && !!value.downloadUrl && !!value.secret;
      });
  }

  onMultiHyperParamsChanged(hyperparams: { [key: string]: any[] }): void {
    this.dynamicHyperparamsExperiment.set(hyperparams ?? {});
  }

  onFormsValid(valid: boolean): void {
    this.hyperParamsValid.set(valid);
  }

  onRunClick(): void {
    if (!this.isValid()) return;
    const inputFilePaths: Record<string, string> = {};
    const inputData: Record<string, string> = {};
    for (const config of this.inputConfigs) {
      const key = this.variableOf(config);
      const value = this.getFormControl(key).value;
      if (typeof value === 'string' && value.trim()) {
        inputFilePaths[key] = value.trim();
      } else if (value && typeof value !== 'string') {
        inputData[key] = `${value.downloadUrl!.replace(/\/$/, '')}/download?secret=${encodeURIComponent(value.secret)}`;
      }
    }
    const create: CreateExperimentDetailDTO = {
      hyperParams: this.dynamicHyperparamsExperiment(),
      federatedAppVersionId: this.data.app.latestVersionId,
      name: this.experimentRunControl.controls.name.value,
      description: this.experimentRunControl.controls.description.value,
      inputFilePaths,
      inputData: JSON.stringify(inputData),
    };
    this.starting.set(true);
    this.experimentService.createExperiment(this.data.app.id, create).pipe(
      takeUntilDestroyed(this.destroyRef),
      finalize(() => this.starting.set(false)),
    ).subscribe(experiment => {
      this.controllerSocketService.notifyStartExperiment();
      this.dialogRef.close(experiment);
    });
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  get formErrors(): string[] {
    const errors: string[] = [];
    const missing = Object.entries(this.experimentRunControl.controls)
      .filter(([, control]) => control.hasError('required')).map(([key]) => key);
    for (const config of this.inputConfigs) {
      if (config.required && !this.getFormControl(this.variableOf(config)).value) missing.push(config.name);
    }
    if (missing.length) errors.push(`Missing required fields: ${missing.join(', ')}`);
    if (!this.hyperParamsValid()) errors.push('Hyperparameters are invalid. Please check the hyperparameter section.');
    return errors;
  }
}
