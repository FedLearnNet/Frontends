import {Component, inject, input, output, signal} from '@angular/core';
import {DatePipe} from "@angular/common";
import {MatIconModule} from "@angular/material/icon";
import {MatButtonModule} from "@angular/material/button";
import {MatTooltipModule} from "@angular/material/tooltip";
import {MatChipsModule} from "@angular/material/chips";
import {FileDTO} from "@shared-lib/modules/files/dto/file";
import {BytesPipe} from "@shared-lib/pipies/bytes.pipe";
import {
  FileDetailDialogComponent
} from "@shared-lib/modules/files/components/file-detail-dialog/file-detail-dialog.component";
import {MatDialog} from "@angular/material/dialog";

@Component({
  selector: 'lib-file-card',
  imports: [DatePipe, MatIconModule, MatButtonModule, MatTooltipModule, MatChipsModule, BytesPipe],
  templateUrl: './file-card.component.html',
  styleUrl: './file-card.component.scss'
})
export class FileCardComponent {
  private readonly dialog: MatDialog = inject(MatDialog);
  file = input.required<FileDTO>();

  showActions = input<boolean>(true);
  forwardClick = input<boolean>(false);

  download = output<FileDTO>();
  fileClicked = output<FileDTO>();
  delete = output<FileDTO>();

  busy = signal(false);

  onSelect() {
    if (this.forwardClick()) {
      this.fileClicked.emit(this.file());
      return;
    }
    this.dialog.open(FileDetailDialogComponent, {
      height: '80vh',
      width: '90vw',
      maxWidth: '90vw',
      autoFocus: false,
      data: this.file(),
    });

  }

  onDownload(event?: MouseEvent) {
    event?.stopPropagation();
    if (this.busy()) return;
    this.busy.set(true);
    this.download.emit(this.file());
    setTimeout(() => this.busy.set(false), 300);
  }

  onDelete(event?: MouseEvent) {
    event?.stopPropagation();
    if (this.busy()) return;
    this.busy.set(true);
    this.delete.emit(this.file());
    setTimeout(() => this.busy.set(false), 300);
  }
}
