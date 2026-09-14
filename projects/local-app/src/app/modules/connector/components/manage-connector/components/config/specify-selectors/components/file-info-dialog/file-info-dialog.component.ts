import {Component, inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {
  CloseableDialogTitleComponent
} from "@shared-lib/components/closeable-dialog-title/closeable-dialog-title.component";
import {ConnectorFilesDetailDTO} from "../../../../../../../dto/upload-info";
import {KvComponent} from "@shared-lib/components/kv/kv.component";
import {DatePipe} from "@angular/common";
import {MatButton} from "@angular/material/button";

@Component({
  selector: 'app-connector-file-info-dialog',
  templateUrl: './file-info-dialog.component.html',
  styleUrl: './file-info-dialog.component.scss',
  imports: [CloseableDialogTitleComponent, KvComponent, DatePipe, MatButton]
})
export class ConnectorFileInfoDialogComponent {
  readonly data = inject<ConnectorFilesDetailDTO>(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(MatDialogRef<ConnectorFileInfoDialogComponent, 'reload' | undefined>);

  get uploadedAt(): string | undefined {
    return this.data.uploadInfo
      .map(info => this.getLastUploaded(info))
      .find((value): value is string => !!value);
  }

  renewDefaultSelector(): void {
    this.dialogRef.close('reload');
  }

  private getLastUploaded(info: unknown): string | undefined {
    if (!info || typeof info !== 'object' || !('lastUploaded' in info)) {
      return undefined;
    }

    const lastUploaded = info['lastUploaded'];
    return typeof lastUploaded === 'string' ? lastUploaded : undefined;
  }
}
