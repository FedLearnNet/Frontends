import {Component, input, output, signal} from '@angular/core';
import {TranslatePipe} from '@ngx-translate/core';
import {UploadProgress} from "@shared-lib/modules/files/model/file-response";
import {
  UploadProgressComponent
} from "@shared-lib/modules/files/components/upload-progress/upload-progress.component";

@Component({
  selector: 'lib-upload-file-area',
  imports: [TranslatePipe, UploadProgressComponent],
  templateUrl: './upload-file-area.component.html',
  styleUrl: './upload-file-area.component.scss'
})
export class UploadFileAreaComponent {
  public progress = input<UploadProgress | undefined>();
  public multiple = input<boolean>(false);
  public accept = input<string>('');
  public disabled = input<boolean>(false);
  public label = input<string>('DIALOG.DRAG_AND_DROP_FILES');

  public toUploadFile = output<File>();
  public toUploadFiles = output<File[]>();

  dragOver = signal<boolean>(false);

  onDragEnter(): void {
    if (this.disabled()) return;
    this.dragOver.set(true);
  }

  onDragLeave(): void {
    this.dragOver.set(false);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.dragOver.set(false);
    if (this.disabled()) return;
    const files = Array.from(event.dataTransfer?.files ?? []);
    this.emit(files);
  }

  onFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files ?? []);
    this.emit(files);
    input.value = '';
  }

  private emit(files: File[]): void {
    if (files.length === 0) return;
    if (this.multiple()) {
      this.toUploadFiles.emit(files);
    } else {
      this.toUploadFile.emit(files[0]);
      this.toUploadFiles.emit([files[0]]);
    }
  }
}
