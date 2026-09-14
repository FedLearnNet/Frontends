import {Component, input, output} from '@angular/core';
import {MatDialogClose, MatDialogTitle} from "@angular/material/dialog";
import {MatIcon} from "@angular/material/icon";
import {MatIconButton} from "@angular/material/button";

@Component({
  selector: 'lib-closeable-dialog-title',
  imports: [
    MatDialogClose,
    MatDialogTitle,
    MatIcon,
    MatIconButton
  ],
  templateUrl: './closeable-dialog-title.component.html',
  styleUrl: './closeable-dialog-title.component.scss'
})
export class CloseableDialogTitleComponent {
  title = input.required<string>();
  allowMaximize = input<boolean>(true);
  maximizedChanged = output<boolean>();
  isMaximized = false;

  toggleMaximize(): void {
    this.isMaximized = !this.isMaximized;
    this.maximizedChanged.emit(this.isMaximized);
  }
}
