import { Component, inject } from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import {ConfirmDialogWithSettings, ConfirmDialogWithSettingsResult} from '../../models';
import {MatButtonModule} from "@angular/material/button";
import {MatCheckboxModule} from "@angular/material/checkbox";

@Component({
  selector: 'app-lib-confirm-dialog-with-settings',
  templateUrl: './confirm-dialog-with-settings.component.html',
  styleUrls: [
    '../../styles/main.scss',
    './confirm-dialog-with-settings.component.scss',
  ],
  imports: [
    MatDialogModule,
    MatButtonModule,
    MatCheckboxModule
  ],
  standalone: true
})
export class ConfirmDialogWithSettingsComponent {
  dialogRef = inject<MatDialogRef<ConfirmDialogWithSettingsComponent, ConfirmDialogWithSettingsResult>>(MatDialogRef);
  data = inject<ConfirmDialogWithSettings>(MAT_DIALOG_DATA);

  confirmButtonData: ConfirmDialogWithSettings = {} as ConfirmDialogWithSettings;

  constructor() {
    const data = this.data;

    this.confirmButtonData = data;
  }

  onDismiss(): void {
    const response: ConfirmDialogWithSettingsResult = {confirmed: false};
    this.dialogRef.close(response);
  }

  onConfirm(): void {
    const settings: { [key: string]: boolean } = {};
    this.confirmButtonData.settings?.forEach(setting => {
      settings[setting.key] = setting.value;
    });
    const response: ConfirmDialogWithSettingsResult = {
      confirmed: true,
      settings: settings,
    };
    this.dialogRef.close(response);
  }
}
