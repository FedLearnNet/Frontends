import {ChangeDetectionStrategy, ChangeDetectorRef, Component, computed, inject, OnInit, signal} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogActions, MatDialogContent, MatDialogRef,} from "@angular/material/dialog";
import {MatButtonModule} from "@angular/material/button";
import {AppDetailDto} from "@shared-lib/modules/store/dto/app-detail";
import {MatIconModule} from "@angular/material/icon";

import {AppService} from "../../service/app.service";
import {MatInputModule} from "@angular/material/input";
import {MatFormFieldModule} from "@angular/material/form-field";
import {
  AbstractControl,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators
} from "@angular/forms";
import {TranslatePipe} from "@ngx-translate/core";
import {ErrorCardComponent} from "@shared-lib/components/error-card/error-card.component";
import {
  CloseableDialogTitleComponent
} from "@shared-lib/components/closeable-dialog-title/closeable-dialog-title.component";
import {startWith} from "rxjs/operators";
import {toSignal} from "@angular/core/rxjs-interop";
import {AppPublishDTO} from "@shared-lib/modules/store/dto/app";
import {MatStepperModule} from "@angular/material/stepper";
import {TOOL_TYPE_CONFIG_DEFAULT_OPTIONS, TOOL_TYPE_CONFIG_MAP} from "../../model/tool-config-type";
import {MatCheckbox} from "@angular/material/checkbox";
import {HintCardComponent} from "@shared-lib/components/hint-card/hint-card.component";
import {
  PipelinePublishInfoDetailComponent
} from "../../../pipeline/components/pipeline-publish-info-detail/pipeline-publish-info-detail.component";
import {ToolIoGraphComponent} from "@shared-lib/modules/store/components/tool-io-graph/tool-io-graph.component";

@Component({
  selector: 'app-app-publish-dialog-warning',
  imports: [
    MatDialogContent,
    MatDialogActions,
    MatStepperModule,
    MatButtonModule,
    MatIconModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    TranslatePipe,
    ErrorCardComponent,
    ReactiveFormsModule,
    CloseableDialogTitleComponent,
    MatCheckbox,
    HintCardComponent,
    PipelinePublishInfoDetailComponent,
    ToolIoGraphComponent
  ],
  templateUrl: './app-publish-dialog-warning.component.html',
  styleUrl: './app-publish-dialog-warning.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppPublishDialogWarningComponent implements OnInit {
  private readonly dialogRef: MatDialogRef<AppPublishDialogWarningComponent> = inject(MatDialogRef);
  private readonly cdr: ChangeDetectorRef = inject(ChangeDetectorRef);
  readonly data = inject<AppDetailDto>(MAT_DIALOG_DATA);
  private readonly appService: AppService = inject(AppService);

  publishAppForm = new FormGroup({
    createModel: new FormControl<boolean>(false, [Validators.required]),
    changelog: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.maxLength(2000)],
    }),
    needsInternetAccess: new FormControl<boolean>(false, {nonNullable: true}),
    needsHostAccess: new FormControl<boolean>(false, {nonNullable: true}),
    latestVersion: new FormControl<string>(this.data.latestVersion, [
      Validators.required,
      Validators.pattern('^\\d+\\.\\d+\\.\\d+$'),
      this.semverGreaterThan(this.data.latestVersion),
    ])
  });
  readonly stepVersionChangelog = new FormGroup({
    latestVersion: this.publishAppForm.controls.latestVersion,
    changelog: this.publishAppForm.controls.changelog,
  });

  readonly stepCreateModel = new FormGroup({
    createModel: this.publishAppForm.controls.createModel,
  });
  private readonly formStatus = toSignal(
    this.publishAppForm.statusChanges.pipe(startWith(this.publishAppForm.status)),
    {initialValue: this.publishAppForm.status}
  );

  readonly canPublish = computed(() => this.formStatus() === 'VALID');

  readonly errorText = signal<string | null>(null);

  ngOnInit(): void {
    this.cdr.detectChanges();
  }

  toggleMaximize(isMaximized: boolean): void {
    if (isMaximized) {
      this.dialogRef.updateSize('100vw', '100vh');
    } else {
      this.dialogRef.updateSize('90vw', '80vh');
    }
  }

  parseSemver(v: string): [number, number, number] | null {
    const m = (v ?? '').trim().match(/^(\d+)\.(\d+)\.(\d+)$/);
    if (!m) return null;
    return [Number(m[1]), Number(m[2]), Number(m[3])];
  }

  isSemverGreater(a: [number, number, number], b: [number, number, number]): boolean {
    if (a[0] !== b[0]) return a[0] > b[0];
    if (a[1] !== b[1]) return a[1] > b[1];
    return a[2] >= b[2];
  }

  semverGreaterThan(prevVersion: string): ValidatorFn {
    const prev = this.parseSemver(prevVersion);
    return (control: AbstractControl<string>): ValidationErrors | null => {
      const cur = this.parseSemver(control.value);

      if (!cur || !prev) return null;

      return this.isSemverGreater(cur, prev) ? null : {versionTooLow: true};
    };
  }

  get isTrainable(): boolean {
    const option = this.data.type ? TOOL_TYPE_CONFIG_DEFAULT_OPTIONS : (
      TOOL_TYPE_CONFIG_MAP[this.data.type] ?? TOOL_TYPE_CONFIG_DEFAULT_OPTIONS);
    return option.supportsTraining;
  }

  publish(): void {
    this.errorText.set(null);

    if (this.publishAppForm.invalid) {
      this.publishAppForm.markAllAsTouched();
      return;
    }

    const {changelog, createModel, latestVersion, needsInternetAccess, needsHostAccess} = this.publishAppForm.getRawValue();

    const publishDTO = {
      changelog: changelog,
      createModel: createModel ?? false,
      version: latestVersion,
      needsHostAccess: needsHostAccess ?? false,
      needsInternetAccess: needsInternetAccess ?? false,
    } as AppPublishDTO;
    this.appService.publishApp(this.data.id, publishDTO).subscribe({
      next: (app) => this.dialogRef.close(app),
      error: (err) => this.errorText.set(err?.message ?? 'Publish failed'),
    });
  }

}
