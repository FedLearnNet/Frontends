import {Component, EventEmitter, Input, Output} from '@angular/core';
import {catchError} from "rxjs";
import {ConnectorUploadService} from "../../../../services/connector-upload.service";
import {ConnectorConfig} from "../../../../models/connector-config";
import {ConnectorStepConfigChangeEmitter} from "../../../../models/connector-step-config";
import {MatSnackBar} from "@angular/material/snack-bar";
import {ReUploadInfo} from "../../../../dto/upload-info";
import {
  ConnectorStepDataSourceMultiFileUploadComponent
} from "../../../manage-connector/components/config/input-file/components/multi-file/multi-file.component";
import {MatDialog} from "@angular/material/dialog";

@Component({
  selector: 'app-run-new-file',
  templateUrl: './run-new-file.component.html',
  styleUrl: './run-new-file.component.scss'
})
export class RunNewFileComponent {
  @Input() config: ConnectorConfig = {};
  @Output() save = new EventEmitter<ConnectorStepConfigChangeEmitter>();

  public isUploading: boolean = false;
  public newFile: boolean = false;
  public reUploadInfo: ReUploadInfo = {};

  constructor(private uploadService: ConnectorUploadService,
              private snackBar: MatSnackBar,
              public dialog: MatDialog,) {
  }


  openUploadDialog() {
    this.dialog.open(ConnectorStepDataSourceMultiFileUploadComponent, {
      width: '400px',
      data: {schema_id: this.config.schemaId}
    });
  }

  hasSupportFile(): boolean {
    return !!(this.config && this.config.inputConfig && this.config.inputConfig.hasSupportFile);
  }

  onFileSelected(event: Event): void {
    if (!this.config.id) {
      console.error('No connector id');
      return;
    }
    this.isUploading = true;
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length <= 0) {
      this.isUploading = false;
      console.error('No files');
      return;
    }
    const file = input.files[0];
    const allowedExtensions = ['.csv', '.txt', '.xls', '.xlsx']; // TODO dynamic
    const fileExtension = file.name.split('.').pop()?.toLowerCase();

    if (!fileExtension || !allowedExtensions.includes(`.${fileExtension}`)) {
      this.isUploading = false;
      console.error('Invalid file type');
      this.snackBar.open('Invalid file type. Please upload a .csv, Excel or .txt file.', 'Close', {
        duration: 5000,
        verticalPosition: 'top',
      });
      return;
    }

    this.uploadService.reUploadFile(this.config.id, file).pipe(
      catchError((error) => {
        this.isUploading = false;
        console.error('Error uploading file:', error);
        this.snackBar.open('An error occurred. Please try again later.', 'Close', {
          duration: 5000,
          verticalPosition: 'top',
        });
        throw error;
      })
    ).subscribe((response: ReUploadInfo): void => {
      this.isUploading = false;
      this.reUploadInfo = response;
      if(response.success) {
        this.snackBar.open('Upload success', 'Close', {
          duration: 5000,
          verticalPosition: 'top',
          horizontalPosition: 'end'
        });
      }
    });
  }

}
