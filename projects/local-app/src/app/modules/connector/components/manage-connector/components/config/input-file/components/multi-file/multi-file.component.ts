import {Component, inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogModule, MatDialogRef} from "@angular/material/dialog";
import {ConnectorStepDataSourceInputFileConfigComponent} from "../../input-file.component";
import {FormBuilder, FormGroup, ReactiveFormsModule} from "@angular/forms";
import {ConnectorUploadService} from "../../../../../../../services/connector-upload.service";
import {catchError} from "rxjs";

import {MatButtonModule} from "@angular/material/button";
import {MatTooltipModule} from "@angular/material/tooltip";
import {MatIconModule} from "@angular/material/icon";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatInputModule} from "@angular/material/input";
import {MatDivider} from "@angular/material/divider";
import {TranslatePipe, TranslateService} from '@ngx-translate/core';
import {MatSnackBar} from '@angular/material/snack-bar';
import {ConnectorFilesDTO} from "../../../../../../../dto/upload-info";
import {UploadProgress} from "@shared-lib/modules/files/model/file-response";
import {
  UploadProgressComponent
} from "@shared-lib/modules/files/components/upload-progress/upload-progress.component";
import {
  UploadFileAreaComponent
} from "@shared-lib/modules/files/components/upload-file-area/upload-file-area.component";

@Component({
  selector: 'app-multi-file',
  imports: [
    MatIconModule,
    MatTooltipModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDivider,
    TranslatePipe,
    UploadProgressComponent,
    UploadFileAreaComponent,
  ],
  templateUrl: './multi-file.component.html',
  styleUrl: './multi-file.component.scss'
})
export class ConnectorStepDataSourceMultiFileUploadComponent implements OnInit {
  dialogRef = inject<MatDialogRef<ConnectorStepDataSourceInputFileConfigComponent>>(MatDialogRef);
  private connectorUploadService = inject(ConnectorUploadService);
  private fb = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);
  private translate = inject(TranslateService);
  data = inject<{
    cohortId: number;
  }>(MAT_DIALOG_DATA);

  uploadForm: FormGroup;
  progress: { [key: string]: UploadProgress } = {};
  files: File[] = [];
  existingFiles: ConnectorFilesDTO[] = [];

  constructor() {
    this.uploadForm = this.fb.group({
      files: [null]
    });
  }

  ngOnInit() {
    this.loadExistingFiles();
  }

  loadExistingFiles() {
    this.connectorUploadService.loadSupportFiles(this.data.cohortId).subscribe(response => {
      this.existingFiles = response;
    });
  }

  onFilesDropped(files: File[]) {
    if (files.length > 0) {
      this.addFiles(files);
    }
  }

  addFiles(files: File[]) {
    this.files = this.files.concat(files);
    this.uploadForm.patchValue({
      files: this.files
    });
    this.resetProgress();
  }

  resetProgress() {
    this.progress = {};
    this.files.forEach(file => {
      this.progress[file.name] = {loaded: 0, total: file.size, progress: 0, inProgress: false};
    });
  }

  onSubmit() {
    if (!this.uploadForm.get('files')) {
      return;
    }
    this.uploadForm.get('files')!.value.forEach((file: File) => {
      this.uploadFile(file);
    });
  }

  uploadFile(file: File) {
    this.progress[file.name] = {loaded: 0, total: file.size, progress: 0, inProgress: true};
    this.connectorUploadService.uploadSupportFileWithProgress(this.data.cohortId, file).pipe(
      catchError((error) => {
        this.snackBar.open(
          this.translate.instant('ERROR.ERROR_IMPORTING_FILE') + ': ' + error,
          this.translate.instant('BUTTON.CLOSE'), {
            duration: 5000,
            verticalPosition: 'top',
          });
        this.progress[file.name] = {
          loaded: 0,
          total: file.size,
          progress: 0,
          inProgress: false,
          error,
        };
        throw error;
      })
    ).subscribe((event: UploadProgress<ConnectorFilesDTO>): void => {
      this.progress[file.name] = event;
      if (!event.inProgress && event.result) {
        this.existingFiles = [...this.existingFiles.filter(f => f.id !== event.result!.id), event.result];
      }
    });
  }

  removeFile(file: File) {
    if (!file) return;
    const fileProgress = this.progress[file.name];
    if (!fileProgress || fileProgress.progress === 0) {
      this.removeFileFromList(file);
      return;
    }
    const existingFile = this.existingFiles.find(existing => existing.fileName === file.name);
    if (!existingFile) {
      this.removeFileFromList(file);
      return;
    }

    this.connectorUploadService.removeSupportFile(this.data.cohortId, existingFile.id).pipe(
      catchError((error) => {
        this.snackBar.open(
          this.translate.instant('ERROR.FILE_DELETION_FAILED') + ': ' + error,
          this.translate.instant('BUTTON.CLOSE'), {
            duration: 5000,
            verticalPosition: 'top',
          });
        throw error;
      })
    ).subscribe((): void => {
      this.removeFileFromList(file);
    });

  }

  removeExistingFile(file: ConnectorFilesDTO) {
    this.connectorUploadService.removeSupportFile(this.data.cohortId, file.id).pipe(
      catchError((error) => {
        this.snackBar.open(
          this.translate.instant('ERROR.FILE_DELETION_FAILED') + ': ' + error,
          this.translate.instant('BUTTON.CLOSE'), {
            duration: 5000,
            verticalPosition: 'top',
          });
        throw error;
      })
    ).subscribe((): void => {
      this.existingFiles = this.existingFiles.filter(existing => existing.id !== file.id);
    });

  }

  removeFileFromList(file: File) {
    this.files = this.files.filter(f => f !== file);
    this.uploadForm.patchValue({
      files: this.files
    });
  }

  clearAllFiles() {
    if (!this.uploadForm.get('files')) {
      return;
    }
    this.uploadForm.get('files')!.value.forEach((file: File) => {
      this.removeFile(file);
    });

    this.files = [];
    this.uploadForm.patchValue({
      files: null
    });
  }
}
