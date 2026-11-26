import {ChangeDetectionStrategy, Component, computed, DestroyRef, inject, signal,} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {CommonModule} from '@angular/common';
import {FormBuilder, FormControl, ReactiveFormsModule, Validators,} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialogModule, MatDialogRef,} from '@angular/material/dialog';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {MatExpansionModule} from '@angular/material/expansion';
import {AppDetailDto} from '@shared-lib/modules/store/dto/app-detail';
import {
  AppRunHyperparameterComponent
} from '@shared-lib/modules/app-execution/components/app-run-hyperparameter/app-run-hyperparameter.component';
import {map, Observable} from "rxjs";
import {startWith} from "rxjs/operators";
import {FederatedParticipantConfigDTO, FLNetParticipantRole} from "../../../../dto/federated-test-run";
import {FileService} from '@shared-lib/modules/files/store/file.service';
import {FileDTO} from '@shared-lib/modules/files/dto/file';
import {UploadProgress} from '@shared-lib/modules/files/model/file-response';
import {UploadProgressComponent} from '@shared-lib/modules/files/components/upload-progress/upload-progress.component';


export interface AppRunFederatedTestConfigDialogData {
  app: AppDetailDto;
  datafiles?: string[];
  value?: FederatedParticipantConfigDTO | null;
  builtImage?: boolean;
}

@Component({
  selector: 'app-app-run-federated-test-config-dialog',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatAutocompleteModule,
    MatExpansionModule,
    AppRunHyperparameterComponent,
    UploadProgressComponent,
  ],
  templateUrl: './app-run-federated-test-config-dialog.component.html',
  styleUrl: './app-run-federated-test-config-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppRunFederatedTestConfigDialogComponent {
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(
    MatDialogRef<
      AppRunFederatedTestConfigDialogComponent,
      FederatedParticipantConfigDTO | null
    >
  );
  private readonly data = inject<AppRunFederatedTestConfigDialogData>(MAT_DIALOG_DATA);
  private readonly fileService = inject(FileService);
  private readonly destroyRef = inject(DestroyRef);
  protected readonly builtImage = this.data.builtImage;
  protected readonly files = signal<FileDTO[]>([]);
  protected readonly uploads = signal<Record<string, UploadProgress>>({});
  protected readonly filesFailed = signal(false);

  protected readonly initialValue = signal<FederatedParticipantConfigDTO | null>(
    this.data?.value ?? null
  );
  protected readonly app = this.data.app;
  protected readonly datafiles = this.data.datafiles ?? [];
  protected dynamicHyperparams: { [key: string]: any } = this.initialValue()?.hyperParams ?? {};
  protected hyperParamsValid = true;
  protected filteredOptions: Record<string, Observable<string[]>> = {};
  protected dataInputControls: Record<string, FormControl<string>> = {};

  protected readonly isEditMode = computed(() => !!this.initialValue());

  protected readonly title = computed(() =>
    this.isEditMode() ? 'Edit participant' : 'Create participant'
  );

  protected readonly subtitle = computed(() =>
    this.isEditMode()
      ? 'Update the local participant configuration for the federated test run.'
      : 'Add a new local participant configuration for the federated test run.'
  );

  protected readonly saveLabel = computed(() =>
    this.isEditMode() ? 'Save changes' : 'Create participant'
  );

  protected onHyperParamsChanged(hyperparams: { [key: string]: any }): void {
    this.dynamicHyperparams = hyperparams;
  }

  protected readonly form = this.fb.nonNullable.group({
    participantId: [
      this.initialValue()?.participantId ?? '',
      [Validators.required, Validators.maxLength(120)],
    ],
    role: [
      this.initialValue()?.role ?? FLNetParticipantRole.CLIENT,
      [Validators.required],
    ]
  });

  constructor() {
    this.fileService.listFiles().pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({next: files => this.files.set(files), error: () => this.filesFailed.set(true)});
    for (const input of this.app.appConfig.input ?? []) {
      const key = input.variableName ?? input.name;
      const control = this.fb.nonNullable.control(
        this.initialValue()?.inputFilePaths?.[key] ?? '',
        input.required ? [Validators.required] : [],
      );
      this.dataInputControls[key] = control;
      this.filteredOptions[key] = control.valueChanges.pipe(
        startWith(control.value ?? ''),
        map(value => this.filterDatafiles(value ?? '')),
      );
    }
  }


  protected readonly participantIdError = computed(() => {
    const control = this.form.controls.participantId;
    if (!control.touched && !control.dirty) {
      return '';
    }
    if (control.hasError('required')) {
      return 'Participant ID is required.';
    }
    if (control.hasError('maxlength')) {
      return 'Participant ID is too long.';
    }
    return '';
  });


  protected close(): void {
    this.dialogRef.close(null);
  }

  protected save(): void {
    const client = this.form.controls.role.value === FLNetParticipantRole.CLIENT;
    if (this.form.invalid || (client && !this.hyperParamsValid) || this.uploading()) {
      this.form.markAllAsTouched();
      Object.values(this.dataInputControls).forEach(control => control.markAsTouched());
      return;
    }

    const hasInvalidDataInput = Object.values(this.dataInputControls).some(control => control.invalid);
    if (client && hasInvalidDataInput) {
      Object.values(this.dataInputControls).forEach(control => control.markAsTouched());
      return;
    }

    const raw = this.form.getRawValue();

    const inputFilePaths = Object.fromEntries(
      (this.app.appConfig.input ?? [])
        .map(input => input.variableName ?? input.name)
        .map(key => [key, this.normalizeOptional(this.dataInputControls[key]?.getRawValue() ?? '')])
        .filter(([, value]) => value !== undefined),
    ) as { [key: string]: string };

    const result: FederatedParticipantConfigDTO = {
      participantId: raw.participantId.trim(),
      role: raw.role,
      hyperParams: Object.keys(this.dynamicHyperparams).length > 0 ? this.dynamicHyperparams : undefined,
      inputFilePaths: Object.keys(inputFilePaths).length > 0 ? inputFilePaths : undefined,
    };

    this.dialogRef.close(result);
  }

  protected dataInputKeys(): string[] {
    return (this.app.appConfig.input ?? []).map(input => input.variableName ?? input.name);
  }

  protected getDataControl(name: string): FormControl<string> {
    return this.dataInputControls[name];
  }

  protected uploading(): boolean {
    return Object.values(this.uploads()).some(upload => upload.inProgress);
  }

  protected inputsValid(): boolean {
    return Object.values(this.dataInputControls).every(control => control.valid);
  }

  protected fileUrl(file: FileDTO): string {
    return `${file.downloadUrl?.replace(/\/$/, '')}/download?secret=${encodeURIComponent(file.secret ?? '')}`;
  }

  protected readonly displayFile = (value: string): string =>
    this.files().find(file => this.fileUrl(file) === value)?.fileName ?? value;

  protected uploadFile(key: string, event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file || this.uploading()) return;
    this.dataInputControls[key].setValue('');
    this.dataInputControls[key].disable();
    this.uploads.update(uploads => ({...uploads, [key]: {progress: 0, inProgress: true}}));
    this.fileService.upload(file).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({next: progress => {
      this.uploads.update(uploads => ({...uploads, [key]: progress}));
      if (!progress.inProgress) this.dataInputControls[key].enable();
      if (progress.result) {
        this.files.update(files => [progress.result!, ...files.filter(f => f.id !== progress.result!.id)]);
        this.dataInputControls[key].setValue(this.fileUrl(progress.result));
      }
    }, error: () => {
      this.dataInputControls[key].enable();
      this.uploads.update(uploads => ({...uploads, [key]: {
        progress: 0, inProgress: false, error: 'Upload failed. Please try again.',
      }}));
    }});
  }

  private normalizeOptional(value: string): string | undefined {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : undefined;
  }

  private filterDatafiles(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.datafiles.filter(option => option.toLowerCase().includes(filterValue));
  }

  protected readonly FLNetParticipantRole = FLNetParticipantRole;
}
