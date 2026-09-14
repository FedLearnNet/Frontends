import {ChangeDetectionStrategy, Component, inject} from '@angular/core';
import {DecimalPipe} from "@angular/common";
import {
  CloseableDialogTitleComponent
} from "@shared-lib/components/closeable-dialog-title/closeable-dialog-title.component";
import {FormsModule} from "@angular/forms";
import {MAT_DIALOG_DATA, MatDialogContent, MatDialogRef} from "@angular/material/dialog";
import {MatDivider} from "@angular/material/divider";
import {MatIconButton} from "@angular/material/button";
import {MatInput, MatLabel, MatSuffix} from "@angular/material/input";
import {MatFormField} from "@angular/material/form-field";
import {MatIcon} from "@angular/material/icon";
import {FileDTO, FileRenameDTO} from "@shared-lib/modules/files/dto/file";
import {
  FileDetailCardComponent
} from "@shared-lib/modules/files/components/file-detail-card/file-detail-card.component";
import {renameFile} from "@shared-lib/modules/files/store/file.actions";
import {Store} from "@ngrx/store";

@Component({
  selector: 'lib-file-detail-dialog',
  imports: [
    CloseableDialogTitleComponent,
    MatDialogContent,
    DecimalPipe,
    FormsModule,
    MatFormField,
    MatLabel,
    MatInput,
    MatIconButton,
    MatIcon,
    MatDivider,
    MatSuffix,
    FileDetailCardComponent
  ],
  templateUrl: './file-detail-dialog.component.html',
  styleUrl: './file-detail-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FileDetailDialogComponent {
  private readonly store: Store = inject(Store);
  readonly dialogRef = inject(MatDialogRef<FileDetailDialogComponent>);
  readonly data = inject<FileDTO>(MAT_DIALOG_DATA);
  fileName: string = this.data.fileName;
  isEditing: boolean = false;


  toggleMaximize(isMaximized: boolean): void {
    if (isMaximized) {
      this.dialogRef.updateSize('100vw', '100vh');
    } else {
      this.dialogRef.updateSize('90vw', '80vh');
    }
  }

  startEditing(): void {
    this.isEditing = true;
  }

  saveFileName(): void {
    if (this.fileName !== this.data.fileName && this.fileName.trim()) {
      this.store.dispatch(renameFile({
        id: this.data.id,
        secret: this.data.secret,
        dto: {
          fileName: this.fileName
        } as FileRenameDTO
      }));
    }
    this.isEditing = false;
  }

  cancelEditing(): void {
    //this.fileName = this.data.name;
    this.isEditing = false;
  }
}
