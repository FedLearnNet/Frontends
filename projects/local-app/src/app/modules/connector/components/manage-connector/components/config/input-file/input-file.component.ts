import {ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {ConnectorStepConfig, ConnectorStepConfigChangeEmitter} from "../../../../../models/connector-step-config";
import {FileUploadSettings} from "../../../../../models/input-config";
import {ConnectorConfig} from "../../../../../models/connector-config";
import {ConnectorUploadService} from "../../../../../services/connector-upload.service";
import {MatSnackBar} from "@angular/material/snack-bar";
import {catchError} from "rxjs";
import {MatDialog} from "@angular/material/dialog";
import {ConnectorStepDataSourceMultiFileUploadComponent} from "./components/multi-file/multi-file.component";

@Component({
  selector: 'app-input-file',
  templateUrl: './input-file.component.html',
  styleUrl: './input-file.component.scss'
})
export class ConnectorStepDataSourceInputFileConfigComponent implements OnInit, ConnectorStepConfig {
  @Input() config: ConnectorConfig = {};
  @Input() schemaId: string;
  @Output() configChange = new EventEmitter<ConnectorConfig>();
  @Output() save = new EventEmitter<ConnectorStepConfigChangeEmitter>();

  public isUploading: boolean = false;

  public settings: FileUploadSettings = {
    mode: 'FILE',
    file: null,
    fileType: 'CSV',
    delimiter: ',',
    hasHeader: true,
    extractSheets: 'ENTIRE',
    mergeType: 'HORIZONTALLY'
  };

  constructor(private uploadService: ConnectorUploadService,
              private snackBar: MatSnackBar,
              public dialog: MatDialog,
              private cdr: ChangeDetectorRef) {
  }

  ngOnInit(): void {
    if (this.config && this.config.inputConfig) {
      this.settings = this.config.inputConfig;
    }
  }

  onFileSelected(event: Event): void {
    this.isUploading = true;
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.settings.file = input.files[0];
    }
    if (!this.settings.file) {
      this.isUploading = false;
      console.error('No files');
      return;
    }
    this.uploadService.uploadFile(this.settings.file).pipe(
      catchError((error) => {
        console.error('Error uploading file:', error);
        this.snackBar.open('An error occurred. Please try again later.', 'Close', {
          duration: 5000,
          verticalPosition: 'top',
        });
        this.settings.file = null;
        this.isUploading = false;
        this.cdr.detectChanges();
        throw error;
      })
    ).subscribe((response: string): void => {
      this.settings.filePath = response;
      this.isUploading = false;
      this.cdr.detectChanges();
    });
  }

  onContinueClick(): boolean {
    if (!this.settings.filePath) {
      this.snackBar.open('Please upload a file.', 'Close', {
        duration: 5000,
        verticalPosition: 'top',
      });
      return false;
    }
    this.config.inputConfig = this.settings;
    this.configChange.emit(this.config);
    return true;
  }

  openUploadDialog() {
    this.dialog.open(ConnectorStepDataSourceMultiFileUploadComponent, {
      width: '400px',
      data: {schema_id: this.schemaId}
    });
  }
}
