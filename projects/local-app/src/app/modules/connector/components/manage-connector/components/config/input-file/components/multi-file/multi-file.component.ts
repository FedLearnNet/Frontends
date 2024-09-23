import {Component, ElementRef, Inject, OnInit, ViewChild} from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef
} from "@angular/material/dialog";
import {ConnectorStepDataSourceInputFileConfigComponent} from "../../input-file.component";
import {FormBuilder, FormGroup, ReactiveFormsModule} from "@angular/forms";
import {ConnectorUploadService} from "../../../../../../../services/connector-upload.service";
import {catchError} from "rxjs";
import {CommonModule} from "@angular/common";
import {MatButtonModule} from "@angular/material/button";
import {MatTooltipModule} from "@angular/material/tooltip";
import {MatIconModule} from "@angular/material/icon";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatInputModule} from "@angular/material/input";
import {MatProgressBarModule} from "@angular/material/progress-bar";
import {MatDivider} from "@angular/material/divider";

@Component({
  selector: 'app-multi-file',
  standalone: true,
  imports: [
    MatIconModule,
    MatTooltipModule,
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressBarModule,
    MatDivider
  ],
  templateUrl: './multi-file.component.html',
  styleUrl: './multi-file.component.scss'
})
export class ConnectorStepDataSourceMultiFileUploadComponent implements OnInit {

  @ViewChild('fileInput') fileInput: ElementRef;

  uploadForm: FormGroup;
  progress: { [key: string]: number } = {};
  files: File[] = [];
  existingFiles: string[] = [];


  constructor(
    public dialogRef: MatDialogRef<ConnectorStepDataSourceInputFileConfigComponent>,
    private connectorUploadService: ConnectorUploadService,
    private fb: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: { schema_id: string },
  ) {
    this.uploadForm = this.fb.group({
      files: [null]
    });
  }

  ngOnInit() {
    this.loadExistingFiles();
  }

  loadExistingFiles() {
    this.connectorUploadService.loadSupportFiles(this.data.schema_id).subscribe(response => {
      this.existingFiles = response;
    });
  }

  onFileChange(event: any) {
    if (event.target.files.length > 0) {
      this.addFiles(Array.from(event.target.files));
    }
  }

  onDrop(event: any) {
    event.preventDefault();
    if (event.dataTransfer.files.length > 0) {
      this.addFiles(Array.from(event.dataTransfer.files));
    }
  }

  onDragOver(event: any) {
    event.preventDefault();
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
      this.progress[file.name] = 0;
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
    this.connectorUploadService.uploadSupportFile(this.data.schema_id, file).pipe(
      catchError((error) => {
        console.error('Error uploading file:', error);
        this.progress[file.name] = -1;
        throw error;
      })
    ).subscribe((percentDone: number): void => {
      this.progress[file.name] = percentDone;
    });
  }

  removeFile(file: File) {
    if (!file) return;
    if (this.progress[file.name] === 0) {
      this.removeFileFromList(file);
      return;
    }
    this.connectorUploadService.removeSupportFile(this.data.schema_id, file.name).pipe(
      catchError((error) => {
        console.error('File deletion failed', error);
        throw error;
      })
    ).subscribe((): void => {
      this.removeFileFromList(file);
    });

  }

  removeExistingFile(filename: string) {
    this.connectorUploadService.removeSupportFile(this.data.schema_id, filename).pipe(
      catchError((error) => {
        console.error('File deletion failed', error);
        throw error;
      })
    ).subscribe((): void => {
      this.existingFiles = this.existingFiles.filter(f => f !== filename);
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

  triggerFileInput() {
    this.fileInput.nativeElement.click();
  }
}
