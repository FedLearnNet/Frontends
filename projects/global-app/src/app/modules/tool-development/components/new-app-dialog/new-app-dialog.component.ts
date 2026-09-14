import {Component, computed, inject} from '@angular/core';
import {toSignal} from '@angular/core/rxjs-interop';
import {startWith} from 'rxjs';
import {MatDialogActions, MatDialogContent, MatDialogRef} from "@angular/material/dialog";
import {
  CloseableDialogTitleComponent
} from "@shared-lib/components/closeable-dialog-title/closeable-dialog-title.component";
import {MatButton} from "@angular/material/button";
import {NgClass} from "@angular/common";
import {MatIcon} from "@angular/material/icon";
import {AppService} from "../../service/app.service";
import {Router} from "@angular/router";
import {ToolTypeSelectorComponent} from "../tool-type-selector/tool-type-selector.component";
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {FederatedAppType, PublishStatus} from "@shared-lib/modules/store/dto/enum";
import {SLUG_REGEX} from "../../helper/validator";
import {MatInput} from "@angular/material/input";
import {MatFormFieldModule} from "@angular/material/form-field";
import {ToolSlugInputComponent} from "../tool-slug-input/tool-slug-input.component";
import {ErrorCardComponent} from "@shared-lib/components/error-card/error-card.component";
import {AppCreateDTO, AppDto} from "@shared-lib/modules/store/dto/app";
import {MatStep, MatStepLabel, MatStepper} from "@angular/material/stepper";
import {StoreCardComponent} from "@shared-lib/modules/store/components/store-card/store-card.component";
import {MatCheckbox} from "@angular/material/checkbox";
import {TOOL_TYPE_CONFIG_MAP} from "../../model/tool-config-type";
import {environment} from "@global-app/env/environment";
import {InfoCardComponent} from "@shared-lib/components/info-card/info-card.component";

@Component({
  selector: 'app-new-app-dialog',
  imports: [
    MatDialogContent,
    CloseableDialogTitleComponent,
    MatButton,
    MatIcon,
    NgClass,
    ToolTypeSelectorComponent,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInput,
    ToolSlugInputComponent,
    ErrorCardComponent,
    MatStepper,
    MatStep,
    MatStepLabel,
    StoreCardComponent,
    MatDialogActions,
    MatCheckbox,
    InfoCardComponent
  ],
  templateUrl: './new-app-dialog.component.html',
  styleUrl: './new-app-dialog.component.scss'
})
export class NewAppDialogComponent {
  private readonly dialogRef: MatDialogRef<NewAppDialogComponent> = inject(MatDialogRef<NewAppDialogComponent>);
  private readonly appService: AppService = inject(AppService);
  private readonly router: Router = inject(Router);

  readonly form = new FormGroup({
    name: new FormControl<string>('', {nonNullable: true, validators: [Validators.required]}),
    slug: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required, Validators.pattern(SLUG_REGEX)],
    }),
    shortDescription: new FormControl<string>('',
      {
        validators: [Validators.required]
      }),
    toolType: new FormControl<FederatedAppType | null>(null,
      {
        validators: [Validators.required]
      }),
    supportsFederatedLearning: new FormControl<boolean>(false)
  });

  readonly name = this.form.controls.name;
  readonly slug = this.form.controls.slug;
  readonly shortDescription = this.form.controls.shortDescription;
  readonly type = this.form.controls.toolType;
  readonly supportsFederatedLearning = this.form.controls.supportsFederatedLearning;

  readonly basicsGroup = new FormGroup({
    name: this.form.controls.name,
    slug: this.form.controls.slug,
    shortDescription: this.form.controls.shortDescription,
  });

  private readonly formValues = toSignal(
    this.form.valueChanges.pipe(startWith(this.form.getRawValue()))
  );

  readonly canSubmit = computed(() => {
    this.formValues();
    return this.form.valid;
  });

  readonly previewApp = computed(() => {
    this.formValues();
    const formValue = this.form.getRawValue();
    const data: AppDto = {
      name: formValue.name,
      slug: formValue.slug,
      shortDescription: formValue.shortDescription!,
      type: formValue.toolType!,
      publishStatus: PublishStatus.UNPUBLISHED,
    } as any;
    return data;
  });

  readonly supportsFederated = computed(() => {
    if (!environment.allowGlobalDataModeling) {
      return false;
    }
    const type = this.previewApp().type;
    return TOOL_TYPE_CONFIG_MAP[type]?.supportsFederated ?? false;
  });

  toggleMaximize(isMaximized: boolean): void {
    if (isMaximized) {
      this.dialogRef.updateSize('100vw', '100vh');
    } else {
      this.dialogRef.updateSize('90vw', '80vh');
    }
  }

  isBasicsValid(): boolean {
    return this.name.valid && this.slug.valid && this.shortDescription.valid;
  }

  goNext(stepper: any) {
    this.name.markAsTouched();
    this.slug.markAsTouched();
    this.shortDescription.markAsTouched();
    if (stepper.selectedIndex === 1) this.type.markAsTouched();

    if (stepper.selectedIndex === 0 && !this.isBasicsValid()) return;
    if (stepper.selectedIndex === 1 && !this.type.valid) return;

    stepper.next();
  }


  goBack(stepper: any) {
    stepper.previous();
  }

  createNewApp(): void {
    if (!this.canSubmit()) return;

    const formValue = this.form.getRawValue();
    const data: AppCreateDTO = {
      name: formValue.name,
      slug: formValue.slug,
      shortDescription: formValue.shortDescription!,
      type: formValue.toolType!,
      supportsFederatedLearning: formValue.supportsFederatedLearning ?? false,
    };
    this.appService.createApp(data).subscribe(
      data => {
        this.router.navigate(["/app", data.id]).then(_r => this.dialogRef.close());
      }
    )
  }
}
