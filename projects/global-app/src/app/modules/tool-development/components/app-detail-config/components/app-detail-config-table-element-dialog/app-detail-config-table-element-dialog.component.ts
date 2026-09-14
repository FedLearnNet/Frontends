import {Component, inject, model} from '@angular/core';
import {
  CloseableDialogTitleComponent
} from "@shared-lib/components/closeable-dialog-title/closeable-dialog-title.component";
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef
} from "@angular/material/dialog";
import {TabularSchemaDTO} from "@shared-lib/modules/app-execution/dto/config";
import {
  AppDetailConfigTableElementComponent
} from "../app-detail-config-table-element/app-detail-config-table-element.component";
import {MatButton} from "@angular/material/button";

@Component({
  selector: 'app-app-detail-config-table-element-dialog',
  imports: [
    CloseableDialogTitleComponent,
    MatDialogContent,
    AppDetailConfigTableElementComponent,
    MatDialogActions,
    MatButton,
    MatDialogClose
  ],
  templateUrl: './app-detail-config-table-element-dialog.component.html',
  styleUrl: './app-detail-config-table-element-dialog.component.scss',
})
export class AppDetailConfigTableElementDialogComponent {
  readonly data = inject<TabularSchemaDTO | null>(MAT_DIALOG_DATA);
  private readonly dialogRef: MatDialogRef<AppDetailConfigTableElementDialogComponent> = inject(MatDialogRef<AppDetailConfigTableElementDialogComponent>);

  schema = model<TabularSchemaDTO>(this.data ?? {});

  toggleMaximize(isMaximized: boolean): void {
    if (isMaximized) {
      this.dialogRef.updateSize('100vw', '100vh');
    } else {
      this.dialogRef.updateSize('90vw', '80vh');
    }
  }
}
