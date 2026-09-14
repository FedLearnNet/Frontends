import {Component, inject} from '@angular/core';
import {
  CloseableDialogTitleComponent
} from "@shared-lib/components/closeable-dialog-title/closeable-dialog-title.component";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {PipelineDTO} from "../../dto/pipeline";
import {PipelineDetailComponent} from "../pipeline-detail/pipeline-detail.component";

@Component({
  selector: 'app-pipeline-detail-dialog',
  imports: [
    CloseableDialogTitleComponent,
    PipelineDetailComponent
  ],
  templateUrl: './pipeline-detail-dialog.component.html',
  styleUrl: './pipeline-detail-dialog.component.scss'
})
export class PipelineDetailDialogComponent {
  private readonly dialogRef: MatDialogRef<PipelineDetailDialogComponent> = inject(MatDialogRef);
  readonly data = inject<PipelineDTO>(MAT_DIALOG_DATA);

  toggleMaximize(isMaximized: boolean): void {
    if (isMaximized) {
      this.dialogRef.updateSize('100vw', '100vh');
    } else {
      this.dialogRef.updateSize('90vw', '80vh');
    }
  }

}
