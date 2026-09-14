import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  effect,
  inject,
  input,
  model,
  output,
  signal
} from '@angular/core';

import {MatInputModule} from "@angular/material/input";
import {FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {MatCardModule} from "@angular/material/card";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatIconModule} from "@angular/material/icon";
import {MatMenuModule} from "@angular/material/menu";
import {MatButtonModule} from "@angular/material/button";
import {MatSelectModule} from "@angular/material/select";
import {MarkDownEditorComponent} from "@shared-lib/components/md-editor/md-editor.component";
import {AppDetailDto} from "@shared-lib/modules/store/dto/app-detail";
import {versionValidator} from "../../../../helper/validator";
import {MatDialog} from "@angular/material/dialog";
import {
  AppPublishDialogWarningComponent
} from "../../../app-publish-dialog-warning/app-publish-dialog-warning.component";

import {TranslatePipe} from "@ngx-translate/core";
import {startWith} from "rxjs/operators";
import {map} from "rxjs";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {BadgeComponent} from "@shared-lib/components/badge/badge.component";
import {DockerImageTagComponent} from "@shared-lib/components/docker-image-tag/docker-image-tag.component";
import {MatTooltip} from "@angular/material/tooltip";
import {ToolSlugInputComponent} from "../../../tool-slug-input/tool-slug-input.component";
import {
  PipelinePublishInfoDialogComponent
} from "../../../../../pipeline/components/pipeline-publish-info-dialog/pipeline-publish-info-dialog.component";

interface SelectOption {
  name: string;
  value: string | number;
}

@Component({
  selector: 'app-app-edit',
  imports: [
    MatInputModule,
    ReactiveFormsModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatMenuModule,
    MatButtonModule,
    MatSelectModule,
    MarkDownEditorComponent,
    TranslatePipe,
    BadgeComponent,
    DockerImageTagComponent,
    MatTooltip,
    ToolSlugInputComponent
  ],
  templateUrl: './app-edit.component.html',
  styleUrl: './app-edit.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppEditComponent {
  private readonly cdr: ChangeDetectorRef = inject(ChangeDetectorRef);
  private readonly dialog: MatDialog = inject(MatDialog);

  app = model.required<AppDetailDto>();
  hideActions = input<boolean>(false);
  published = output<AppDetailDto>();
  isValid = output<boolean>();

  longDescriptionContent = signal<string>('');

  readonly urlRegex: RegExp = /^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w.-]+)+[\w\-_~:/?#[\]@!$&'()*+,;=.]+$/;

  editAppForm = new FormGroup({
    name: new FormControl<string>('', [Validators.required]),
    slug: new FormControl<string>('', [Validators.required, Validators.pattern(/^[a-z0-9]+(?:[-][a-z0-9]+)*$/)]),
    type: new FormControl<string>('', [Validators.required]),
    shortDescription: new FormControl<string>('', [Validators.required]),
    longDescription: new FormControl<string>(''),
    sourceUrl: new FormControl<string>('', [Validators.pattern(this.urlRegex)]),
    latestVersion: new FormControl<string>(
      {value: '', disabled: true}, [Validators.required,
        Validators.pattern('^\\d+\\.\\d+\\.\\d+$')
      ])
  });


  appTypes: SelectOption[] = [
    {name: 'Preprocessing', value: 'PRE_PROCESSING'},
    {name: 'Learning', value: 'ANALYSIS'},
    {name: 'Postprocessing', value: 'POST_PROCESSING'},
    {name: 'Evaluation', value: 'EVALUATION'},
    {name: 'Algorithimic-Analysis', value: 'SELF_LEARNED'},
    {name: 'Data Transformation', value: 'DATA_TRANSFORMATION'},
    {name: 'Extractor', value: 'EXTRACTOR'},
    {name: 'Export', value: 'EXPORT'}
  ];

  constructor() {
    this.editAppForm.statusChanges
      .pipe(
        startWith(this.editAppForm.status),
        map(() => this.editAppForm.valid),
        takeUntilDestroyed()
      )
      .subscribe(v => {
        this.isValid.emit(v)
      });

    effect(() => {
      const a = this.app();
      this.editAppForm.patchValue(a as any, {emitEvent: false});
      this.longDescriptionContent.set(a.longDescription ?? '');
      const ctrl = this.editAppForm.controls.latestVersion;
      ctrl.setValidators([
        Validators.required,
        Validators.pattern('^\\d+\\.\\d+\\.\\d+$'),
        versionValidator(a.latestVersion ?? '0.0.0'),
      ]);
      ctrl.updateValueAndValidity({emitEvent: false});
    });
  }

  onSubmit(): void {
    if (this.editAppForm.invalid) {
      this.editAppForm.markAllAsTouched();
      return;
    }
    const next: AppDetailDto = {
      ...this.app(),
      ...this.editAppForm.getRawValue(),
      longDescription: this.longDescriptionContent(),
    } as AppDetailDto;
    this.app.set(next);
  }

  cancelEdit() {
    const a = this.app();
    this.editAppForm.reset(a as any, {emitEvent: false});
    this.cdr.detectChanges();
  }

  publish() {
    const dialogRef = this.dialog.open(AppPublishDialogWarningComponent, {
      data: this.app(),
      height: '80vh',
      width: '90vw',
      maxWidth: '100vw',
      maxHeight: '100vh',
      autoFocus: false,
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result !== undefined) {
        this.app.set(result);
        this.published.emit(this.app());
        this.cdr.detectChanges();
      }
    });
  }

  showPipelinePublishInfo(): void {
    const info = this.app().publishInfo;
    if (!info) {
      return;
    }
    this.dialog.open(PipelinePublishInfoDialogComponent, {
      data: info,
      height: '80vh',
      width: '90vw',
      maxWidth: '100vw',
      maxHeight: '100vh',
      autoFocus: false,
    });

  }


  update(): void {
    this.app.update(a => ({
      ...a,
      ...this.editAppForm.getRawValue(),
      longDescription: this.longDescriptionContent()
    } as AppDetailDto));
  }

  updateLongDescription(md: string): void {
    this.longDescriptionContent.set(md);
  }

}
