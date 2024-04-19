import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ConfirmDialog } from '../../models';

@Component({
  selector: 'lib-confirm-dialog',
  templateUrl: './confirm-dialog.component.html',
  styleUrls: [
      '../../styles/main.scss',
      './confirm-dialog.component.scss',
  ]
})
export class ConfirmDialogComponent {
  confirmButtonData: ConfirmDialog = {} as ConfirmDialog;

  constructor(
      public dialogRef: MatDialogRef<ConfirmDialogComponent>,

      @Inject(MAT_DIALOG_DATA) public data: ConfirmDialog,
  ) {
    this.confirmButtonData = data;
  }

  onDismiss(): void {
    this.dialogRef.close(false);
  }

  onConfirm(): void {
    this.dialogRef.close(true);
  }
}
