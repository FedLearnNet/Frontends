import {Component, inject} from '@angular/core';
import {
  CloseableDialogTitleComponent
} from "@shared-lib/components/closeable-dialog-title/closeable-dialog-title.component";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {
  PipelinePublishInfoDetailComponent
} from "../pipeline-publish-info-detail/pipeline-publish-info-detail.component";
import {AppPublishInfoDTO} from "@shared-lib/modules/store/dto/publish-info";

@Component({
  selector: 'app-pipeline-publish-info-dialog',
  imports: [
    CloseableDialogTitleComponent,
    PipelinePublishInfoDetailComponent
  ],
  templateUrl: './pipeline-publish-info-dialog.component.html',
  styleUrl: './pipeline-publish-info-dialog.component.scss',
})
export class PipelinePublishInfoDialogComponent {
  private readonly dialogRef: MatDialogRef<PipelinePublishInfoDialogComponent> = inject(MatDialogRef);
  readonly data = inject<AppPublishInfoDTO>(MAT_DIALOG_DATA);

  toggleMaximize(isMaximized: boolean): void {
    if (isMaximized) {
      this.dialogRef.updateSize('100vw', '100vh');
    } else {
      this.dialogRef.updateSize('90vw', '80vh');
    }
  }
}
