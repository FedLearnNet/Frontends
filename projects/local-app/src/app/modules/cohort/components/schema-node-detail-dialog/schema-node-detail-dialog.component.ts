import {Component, computed, inject} from '@angular/core';
import {
  CloseableDialogTitleComponent
} from "@shared-lib/components/closeable-dialog-title/closeable-dialog-title.component";
import {MAT_DIALOG_DATA, MatDialogContent, MatDialogRef} from "@angular/material/dialog";
import {
  SchemaNodeDetailComponent,
  SchemaNodeDetailData
} from "@local-app/cohort/components/schema-node-detail/schema-node-detail.component";

@Component({
  selector: 'app-schema-node-detail-dialog',
  imports: [
    CloseableDialogTitleComponent,
    MatDialogContent,
    SchemaNodeDetailComponent
  ],
  templateUrl: './schema-node-detail-dialog.component.html',
  styleUrl: './schema-node-detail-dialog.component.scss',
})
export class SchemaNodeDetailDialogComponent {
  private readonly dialogRef: MatDialogRef<SchemaNodeDetailDialogComponent> = inject(MatDialogRef);
  readonly data = inject<SchemaNodeDetailData>(MAT_DIALOG_DATA);

  readonly title = computed(() => this.data.name || 'Schema node');

  toggleMaximize(isMaximized: boolean): void {
    if (isMaximized) {
      this.dialogRef.updateSize('100vw', '100vh');
    } else {
      this.dialogRef.updateSize('90vw', '80vh');
    }
  }
}
