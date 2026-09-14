import {Component, inject} from '@angular/core';
import {
  CloseableDialogTitleComponent
} from "@shared-lib/components/closeable-dialog-title/closeable-dialog-title.component";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {ModelDetailDto, ModelVersionDto} from "@shared-lib/modules/app-execution/dto/model";
import {
  ModelVersionDetailComponent
} from "@global-app/model-store/components/model-version-detail/model-version-detail.component";

interface ModelDetail {
  model: ModelDetailDto;
  version: ModelVersionDto;
}

@Component({
  selector: 'app-model-version-detail-dialog',
  imports: [
    CloseableDialogTitleComponent,
    ModelVersionDetailComponent
  ],
  templateUrl: './model-version-detail-dialog.component.html',
  styleUrl: './model-version-detail-dialog.component.scss'
})
export class ModelVersionDetailDialogComponent {
  private readonly dialogRef: MatDialogRef<ModelVersionDetailDialogComponent> = inject(MatDialogRef);
  readonly data = inject<ModelDetail>(MAT_DIALOG_DATA);

  toggleMaximize(isMaximized: boolean): void {
    if (isMaximized) {
      this.dialogRef.updateSize('100vw', '100vh');
    } else {
      this.dialogRef.updateSize('90vw', '80vh');
    }
  }

  getDialogTitle() {
    return this.data.model.name + " (" + this.data.version.modelVersion + ")";
  }
}
