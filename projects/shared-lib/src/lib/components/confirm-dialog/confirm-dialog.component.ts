import { Component, inject } from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import {ConfirmDialog} from '../../models';
import {MatButtonModule} from "@angular/material/button";

@Component({
  selector: 'app-lib-confirm-dialog',
  templateUrl: './confirm-dialog.component.html',
  styleUrls: [
    '../../styles/main.scss',
    './confirm-dialog.component.scss',
  ],
  imports: [
    MatDialogModule,
    MatButtonModule
  ]
})
export class ConfirmDialogComponent {
  dialogRef = inject<MatDialogRef<ConfirmDialogComponent>>(MatDialogRef);
  data = inject<ConfirmDialog>(MAT_DIALOG_DATA);

  confirmButtonData: ConfirmDialog = {} as ConfirmDialog;

  constructor() {
    const data = this.data;

    this.confirmButtonData = data;
  }

  onDismiss(): void {
    this.dialogRef.close(false);
  }

  onConfirm(): void {
    this.dialogRef.close(true);
  }
}
