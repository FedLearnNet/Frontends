import {
  ChangeDetectionStrategy, ChangeDetectorRef,
  Component,
  EventEmitter,
  inject,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges
} from '@angular/core';
import {CommonModule} from "@angular/common";
import {MatInputModule} from "@angular/material/input";
import {FormControl, FormGroup, FormsModule, ReactiveFormsModule, UntypedFormGroup, Validators} from "@angular/forms";
import {MatCardModule} from "@angular/material/card";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatIconModule} from "@angular/material/icon";
import {MatMenuModule} from "@angular/material/menu";
import {MatButtonModule} from "@angular/material/button";
import {MatSelectModule} from "@angular/material/select";
import {AppDto} from "@global-app/app-store/dto/app";
import {MarkDownEditorComponent} from "@shared-lib/components/md-editor/md-editor.component";
import {ConfigInputEditModel} from "../../../../model/config";
import {AppDetailDto} from "@global-app/app-store/dto/app-detail";
import {versionValidator} from "../../../../helper/validator";
import {MatDialog} from "@angular/material/dialog";
import {
  AppPublishDialogWarningComponent
} from "@global-app/app-store/components/app-publish-dialog-warning/app-publish-dialog-warning.component";

interface SelectOption {
  name: string;
  value: string | number;
}

@Component({
  selector: 'app-app-edit',
  standalone: true,
  imports: [CommonModule,
    MatInputModule,
    ReactiveFormsModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatMenuModule,
    MatButtonModule,
    MatSelectModule, MarkDownEditorComponent],
  templateUrl: './app-edit.component.html',
  styleUrl: './app-edit.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppEditComponent implements OnInit, OnChanges {
  private readonly cdr: ChangeDetectorRef = inject(ChangeDetectorRef);
  private readonly dialog: MatDialog = inject(MatDialog);
  @Input() app?: AppDetailDto;
  @Output() configChanged: EventEmitter<AppDetailDto> = new EventEmitter<AppDetailDto>();
  @Output() published: EventEmitter<AppDetailDto> = new EventEmitter<AppDetailDto>();

  readonly urlRegex: RegExp = /^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w.-]+)+[\w\-_~:/?#[\]@!$&'()*+,;=.]+$/;
  readonly aiStoreUrl = `${location.origin}/app-store/`;

  longDescriptionContent = '';

  editAppForm = new FormGroup({
    name: new FormControl<string>('', [Validators.required]),
    imageName: new FormControl<string>('', [Validators.required, Validators.pattern(/^[a-z0-9]+(?:[._-]{1,2}[a-z0-9]+)*$/)]),
    slug: new FormControl<string>('', [Validators.pattern(/^[a-z0-9]+(?:[-][a-z0-9]+)*$/)]),
    type: new FormControl<string>('', [Validators.required]),
    shortDescription: new FormControl<string>('', [Validators.required]),
    longDescription: new FormControl<string>(''),
    //longDescriptionUrl: new FormControl<string>('', [Validators.pattern(this.urlRegex)]),
    //tags: new FormControl<string>(''),
    //hasFrontend: new FormControl<string>(''),
    //stopAppManually: new FormControl<string>(''),
    //publishStatus: new FormControl<string>('', [Validators.required]),
    //certificationLeveln: new FormControl<string>('', [Validators.required]),
    sourceUrl: new FormControl<string>('', [Validators.pattern(this.urlRegex)]),
    latestVersion: new FormControl<string>('', [Validators.required,
      Validators.pattern('^\\d+\\.\\d+\\.\\d+$'),
      versionValidator(this.app?.latestVersion ?? '0.0.0')
    ])
  });


  appTypes: SelectOption[] = [
    {name: 'Pre-Processing', value: 'PRE_PROCESSING'},
    {name: 'Analysis', value: 'ANALYSIS'},
    {name: 'Post-processing', value: 'POST_PROCESSING'},
    {name: 'Evaluation', value: 'EVALUATION'},
  ];

  ngOnInit() {
    this.editAppForm.controls.latestVersion.setValidators([
      Validators.required,
      Validators.pattern('^\\d+\\.\\d+\\.\\d+$'),
      versionValidator(this.app?.latestVersion ?? '0.0.0')
    ]);
    this.updateForm();
    this.editAppForm.controls.latestVersion.updateValueAndValidity();
    this.cdr.detectChanges();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['app']) {
      console.log('Config has changed:', changes['app'].currentValue);
      this.updateForm();
      this.cdr.detectChanges();
    }
  }

  onSubmit() {
    //TODO
    this.app = {...this.app, ...this.editAppForm.value} as any;
    this.configChanged.emit(this.app);
    this.cdr.detectChanges();
  }

  cancelEdit() {
    this.updateForm();
    this.cdr.detectChanges();
  }

  publish() {
    const dialogRef = this.dialog.open(AppPublishDialogWarningComponent, {
      data: this.app
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result !== undefined) {
        this.app = result;
        this.published.emit(this.app);
        this.cdr.detectChanges();
      }
    });
  }

  update() {
    this.configChanged.emit(this.app);
    this.cdr.detectChanges();
  }

  updateLongDescription(md: string) {
    this.longDescriptionContent = md;
    this.cdr.detectChanges();
  }

  private updateForm() {
    if (!this.app) {
      this.app = {} as AppDetailDto;
    }
    this.editAppForm.patchValue(this.app);
    this.longDescriptionContent = this.app.longDescription ?? '';
  }
}
