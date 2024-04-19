import { Component, Input, Output, EventEmitter } from '@angular/core';
import { AbstractControl, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'lib-drag-and-drop-file',
  templateUrl: './drag-and-drop-file.component.html',
  styleUrl: './drag-and-drop-file.component.scss'
})
export class DragAndDropFileComponent {
  @Input() files: AbstractControl | null = new FormControl();
  @Input() disabled: boolean | null = false;
  @Output() filesChange = new EventEmitter<any>();

  uploadedFiles: any[] = [];

  ngOnInit() {
    this.uploadedFiles = this.files?.value;
  }

  onFileDropped($event: any) {
    this.prepareFilesList($event);
  }

  fileBrowseHandler(target: any) {
    this.prepareFilesList(target.files);
  }

  prepareFilesList(files: Array<any>) {
    for (const file of files) {
      if (this.uploadedFiles.find(uploadedFile => uploadedFile.name === file.name && uploadedFile.size === file.size)) {
        continue;
      }

      this.uploadedFiles.push(file);
    }

    this.filesChange.emit(this.uploadedFiles);
  }

  deleteFile(index: number) {
    this.uploadedFiles.splice(index, 1);
  }

  formatBytes(bytes: number) {
    if (bytes === 0) {
      return '0 Bytes';
    }

    const kilobytes = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(kilobytes));
    return parseFloat((bytes / Math.pow(kilobytes, i)).toFixed()) + ' ' + sizes[i];
  }

  isRequired() {
    return this.files?.hasValidator(Validators.required);
  }

  isInvalid() {
    return this.files?.touched && this.files.invalid;
  }
}
