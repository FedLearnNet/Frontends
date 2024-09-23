import {ChangeDetectorRef, Component, EventEmitter, Input, Output} from '@angular/core';
import {ConnectorStepConfig, ConnectorStepConfigChangeEmitter} from "../../../../../models/connector-step-config";
import {ConnectorConfig} from "../../../../../models/connector-config";
import {ConnectorUploadService} from "../../../../../services/connector-upload.service";
import {MatSnackBar} from "@angular/material/snack-bar";
import {catchError} from "rxjs";
import {UploadInfoDialog, UploadInfoDTO} from "../../../../../dto/upload-info";
import {MatDialog} from "@angular/material/dialog";
import {ConnectorStepSpecifySelectorsChangeNameComponent} from "./components/change-name/change-name.component";

@Component({
  selector: 'app-specify-selectors',
  templateUrl: './specify-selectors.component.html',
  styleUrl: './specify-selectors.component.scss'
})
export class ConnectorStepSpecifySelectorsComponent implements ConnectorStepConfig {
  @Input() config: ConnectorConfig;
  @Output() save = new EventEmitter<ConnectorStepConfigChangeEmitter>();

  constructor(private uploadService: ConnectorUploadService,
              private snackBar: MatSnackBar,
              private cdr: ChangeDetectorRef,
              public dialog: MatDialog) {
  }

  load_columns() {
    if (this.config.inputConfig && this.config.inputConfig.filePath) {
      this.uploadService.getFileInfo(this.config.inputConfig).pipe(
        catchError((error) => {
          console.error('Error loading columns:', error);
          this.snackBar.open('An error occurred while loading columns. Please try again later.', 'Close', {
            duration: 5000,
            verticalPosition: 'top',
          });
          this.cdr.detectChanges();
          throw error;
        })
      ).subscribe((info: UploadInfoDTO) => {
        this.config.fileInfo = info;
        this.cdr.detectChanges();
      });
    }
  }

  openRenameDialog(renamedColumn: string, columnName: string, index: number): void {
    const deleted = this.config.fileInfo!.deletedColumns[index];
    const dialogRef = this.dialog.open(ConnectorStepSpecifySelectorsChangeNameComponent, {
      data: {renamedColumn: renamedColumn, columnName: columnName, deleted: deleted}
    });

    dialogRef.afterClosed().subscribe((result: UploadInfoDialog) => {
      this.config.fileInfo!.renamedColumns[index] = result.renamedColumn;
      this.config.fileInfo!.deletedColumns[index] = result.deleted;
      this.cdr.detectChanges();
    });
  }

  headerClick(event: { columnName: string, index: number }): void {
    const name = this.config.fileInfo!.columns[event.index];
    this.openRenameDialog(event.columnName, name, event.index)
    console.log(`Header clicked: ${event.columnName} at index ${event.index}`);
  }

  onContinueClick(): boolean {
    if (!this.config.fileInfo || !this.config.fileInfo.columns) {
      this.snackBar.open('Please select Columns first.', 'Close', {
        duration: 5000,
        verticalPosition: 'top',
      });
      return false;
    }
    return true;
  }
}
