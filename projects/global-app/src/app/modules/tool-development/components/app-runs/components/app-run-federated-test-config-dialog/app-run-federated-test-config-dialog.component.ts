import {ChangeDetectionStrategy, Component, computed, inject, signal,} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormBuilder, FormControl, ReactiveFormsModule, Validators,} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialogModule, MatDialogRef,} from '@angular/material/dialog';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {AppDetailDto} from '@shared-lib/modules/store/dto/app-detail';
import {
  AppRunHyperparameterComponent
} from '@shared-lib/modules/app-execution/components/app-run-hyperparameter/app-run-hyperparameter.component';
import {map, Observable} from "rxjs";
import {startWith} from "rxjs/operators";
import {FederatedParticipantConfigDTO, FLNetParticipantRole} from "../../../../dto/federated-test-run";


export interface AppRunFederatedTestConfigDialogData {
  app: AppDetailDto;
  datafiles?: string[];
  value?: FederatedParticipantConfigDTO | null;
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
    AppRunHyperparameterComponent,
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
    if (this.form.invalid || !this.hyperParamsValid) {
      this.form.markAllAsTouched();
      Object.values(this.dataInputControls).forEach(control => control.markAsTouched());
      return;
    }

    const hasInvalidDataInput = Object.values(this.dataInputControls).some(control => control.invalid);
    if (hasInvalidDataInput) {
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
