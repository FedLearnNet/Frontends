import {Component, inject} from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle
} from '@angular/material/dialog';
import {DecimalPipe} from '@angular/common';
import {MatTableModule} from '@angular/material/table';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatChip} from '@angular/material/chips';
import {ConnectorFilesDTO} from "../../../../../../../dto/upload-info";
import {TimeBadgeComponent} from "@shared-lib/components/time-badge/time-badge.component";
import {BadgeComponent} from "@shared-lib/components/badge/badge.component";
import { TranslatePipe } from '@ngx-translate/core';

interface InputFileSelectDialogData {
  files: ConnectorFilesDTO[];
  selectedFileId: number | null;
}

@Component({
  selector: 'app-input-file-select-dialog',
    imports: [
        MatDialogTitle,
        MatDialogContent,
        MatDialogActions,
        MatDialogClose,
        MatTableModule,
        MatButtonModule,
        MatIconModule,
        MatChip,
        DecimalPipe,
        TimeBadgeComponent,
        BadgeComponent,
        TranslatePipe,
    ],
  templateUrl: './input-file-select-dialog.component.html',
  styleUrl: './input-file-select-dialog.component.scss',
})
export class InputFileSelectDialogComponent {
  readonly dialogRef = inject(MatDialogRef<InputFileSelectDialogComponent, ConnectorFilesDTO>);
  readonly data = inject<InputFileSelectDialogData>(MAT_DIALOG_DATA);
  readonly displayedColumns = ['fileName', 'contentType', 'size', 'createdAt', 'actions'];

  selectFile(file: ConnectorFilesDTO): void {
    this.dialogRef.close(file);
  }

  isSelected(file: ConnectorFilesDTO): boolean {
    return file.id === this.data.selectedFileId;
  }
}
