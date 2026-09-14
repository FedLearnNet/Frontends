import {Component, inject} from '@angular/core';
import {
  CloseableDialogTitleComponent
} from "@shared-lib/components/closeable-dialog-title/closeable-dialog-title.component";
import {MAT_DIALOG_DATA, MatDialogActions, MatDialogContent, MatDialogRef} from "@angular/material/dialog";
import {TranslatePipe} from "@ngx-translate/core";
import {MatButton} from "@angular/material/button";
import {AppService} from "../../service/app.service";
import {AppDto} from "@shared-lib/modules/store/dto/app";
import {ToolStartupGeneratorCreateDTO} from "../../dto/startup";
import {HintCardComponent} from "@shared-lib/components/hint-card/hint-card.component";
import {ErrorCardComponent} from "@shared-lib/components/error-card/error-card.component";
import {MatSlideToggle} from "@angular/material/slide-toggle";
import {MatDivider} from "@angular/material/list";
import {FormBuilder, ReactiveFormsModule} from "@angular/forms";

@Component({
  selector: 'app-app-generate-startup-code',
  imports: [
    CloseableDialogTitleComponent,
    MatDialogContent,
    TranslatePipe,
    MatButton,
    MatDialogActions,
    HintCardComponent,
    ErrorCardComponent,
    MatSlideToggle,
    MatDivider,
    ReactiveFormsModule
  ],
  templateUrl: './app-generate-startup-code.component.html',
  styleUrl: './app-generate-startup-code.component.scss',
})
export class AppGenerateStartupCodeComponent {
  private readonly appService: AppService = inject(AppService);
  readonly data = inject<AppDto>(MAT_DIALOG_DATA);
  private readonly dialogRef: MatDialogRef<AppGenerateStartupCodeComponent> = inject(MatDialogRef<AppGenerateStartupCodeComponent>);
  private readonly fb = inject(FormBuilder);

  readonly form = this.fb.nonNullable.group({
    enableConfigSync: this.fb.nonNullable.control(true),
    enableProjectSetup: this.fb.nonNullable.control(true),
    prioLocalConfig: this.fb.nonNullable.control(true),
    tracePerformance: this.fb.nonNullable.control(false),
    sendConsoleLogs: this.fb.nonNullable.control(false),
  });

  onSubmit() {
    if (!this.data.id) {
      return;
    }
    const v = this.form.getRawValue();

    const dto: ToolStartupGeneratorCreateDTO = {
      enableConfigSync: v.enableConfigSync,
      enableProjectSetup: v.enableProjectSetup,
      prioLocalConfig: v.prioLocalConfig,
      tracePerformance: v.tracePerformance,
      sendConsoleLogs: v.sendConsoleLogs,
    };

    this.appService.generateStartupZip(this.data.id, dto).subscribe(data => {
      data.click();
      this.dialogRef.close();
    });
  }

  toggleMaximize(isMaximized: boolean): void {
    if (isMaximized) {
      this.dialogRef.updateSize('100vw', '100vh');
    } else {
      this.dialogRef.updateSize('90vw', '80vh');
    }
  }

}
