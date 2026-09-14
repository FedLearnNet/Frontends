import {Component, inject} from '@angular/core';
import {
  CloseableDialogTitleComponent
} from "@shared-lib/components/closeable-dialog-title/closeable-dialog-title.component";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {PipelineDTO} from "../../dto/pipeline";
import {PipelineListComponent} from "../pipeline-list/pipeline-list.component";


@Component({
  selector: 'app-pipeline-list-dialog',
  imports: [
    CloseableDialogTitleComponent,
    PipelineListComponent
  ],
  templateUrl: './pipeline-list-dialog.component.html',
  styleUrl: './pipeline-list-dialog.component.scss'
})
export class PipelineListDialogComponent {
  private readonly dialogRef: MatDialogRef<PipelineListDialogComponent> = inject(MatDialogRef);
  readonly data = inject<PipelineDTO>(MAT_DIALOG_DATA);


  toggleMaximize(isMaximized: boolean): void {
    if (isMaximized) {
      this.dialogRef.updateSize('100vw', '100vh');
    } else {
      this.dialogRef.updateSize('90vw', '80vh');
    }
  }
}
