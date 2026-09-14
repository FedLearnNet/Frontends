import {Component, inject} from '@angular/core';
import {
  CloseableDialogTitleComponent
} from "@shared-lib/components/closeable-dialog-title/closeable-dialog-title.component";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {MarkdownComponent, provideMarkdown} from "ngx-markdown";

export interface MarkdownDialogData {
  title?: string;
  markdown: string;
  copyToClipboard?: boolean;
}

@Component({
  selector: 'lib-markdown-dialog',
  imports: [
    CloseableDialogTitleComponent,
    MarkdownComponent
  ],
  templateUrl: './markdown-dialog.component.html',
  styleUrl: './markdown-dialog.component.scss',
  providers: [
    provideMarkdown(),
  ],
})
export class MarkdownDialogComponent {
  private readonly dialogRef: MatDialogRef<MarkdownDialogComponent> = inject(MatDialogRef<MarkdownDialogComponent>);
  public readonly data = inject<MarkdownDialogData>(MAT_DIALOG_DATA);

  get title() {
    return this.data.title ?? "Detail";
  }

  toggleMaximize(isMaximized: boolean): void {
    if (isMaximized) {
      this.dialogRef.updateSize('100vw', '100vh');
    } else {
      this.dialogRef.updateSize('90vw', '80vh');
    }
  }
}
