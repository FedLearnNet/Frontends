import {Component, input, OnInit, output} from '@angular/core';
import {AbstractControl, FormControl, Validators} from '@angular/forms';
import {DragAndDropDirective} from "@shared-lib/directives/drag-and-drop.directive";
import {TranslatePipe} from "@ngx-translate/core";
import {NgClass} from "@angular/common";
import {MatIcon} from "@angular/material/icon";

@Component({
  selector: 'app-lib-drag-and-drop-file',
  templateUrl: './drag-and-drop-file.component.html',
  styleUrl: './drag-and-drop-file.component.scss',
  imports: [
    DragAndDropDirective,
    MatIcon,
    TranslatePipe,
    NgClass,
  ],
  standalone: true
})
export class DragAndDropFileComponent implements OnInit {
  files = input<AbstractControl>(new FormControl());
  disabled = input<boolean>(false);
  multiple = input<boolean>(true);
  label = input<string>();
  accept = input<string>();

  filesChange = output<any>();

  uploadedFiles: any[] = [];

  ngOnInit() {
    this.uploadedFiles = this.files().value;
    if (!Array.isArray(this.uploadedFiles) || this.uploadedFiles.length === 0) {
      this.uploadedFiles = [];
    }
  }

  onFileDropped($event: any) {
    this.prepareFilesList($event);
  }

  fileBrowseHandler(target: any) {
    this.prepareFilesList(target.files);
  }

  prepareFilesList(files: Array<any>) {
    for (const file of files) {
      if (this.uploadedFiles.length > 0 &&
        this.uploadedFiles.find(uploadedFile => uploadedFile && uploadedFile.name === file.name && uploadedFile.size === file.size)) {
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
    return this.files().hasValidator(Validators.required);
  }

  isInvalid() {
    return this.files().touched && this.files().invalid;
  }
}
