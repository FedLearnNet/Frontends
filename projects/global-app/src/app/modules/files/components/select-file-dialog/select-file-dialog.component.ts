import {Component, inject, OnInit} from '@angular/core';
import {
  CloseableDialogTitleComponent
} from "@shared-lib/components/closeable-dialog-title/closeable-dialog-title.component";
import {MatDialogRef} from "@angular/material/dialog";
import {ErrorCardComponent} from "@shared-lib/components/error-card/error-card.component";
import {FileCardComponent} from "@shared-lib/modules/files/components/file-card/file-card.component";
import {SkeletonLoaderComponent} from "@shared-lib/components/skeleton-loader/skeleton-loader.component";
import {Store} from "@ngrx/store";
import {selectAllFiles, selectFilesError, selectFilesLoading} from "@shared-lib/modules/files/store/file.selectors";
import {loadFiles} from "@shared-lib/modules/files/store/file.actions";
import {FileDTO} from "@shared-lib/modules/files/dto/file";

@Component({
  selector: 'app-select-file-dialog',
  imports: [
    CloseableDialogTitleComponent,
    ErrorCardComponent,
    FileCardComponent,
    SkeletonLoaderComponent
  ],
  templateUrl: './select-file-dialog.component.html',
  styleUrl: './select-file-dialog.component.scss',
})
export class SelectFileDialogComponent implements OnInit {
  private readonly store: Store = inject(Store);
  private readonly dialogRef: MatDialogRef<SelectFileDialogComponent> = inject(MatDialogRef);

  readonly files = this.store.selectSignal(selectAllFiles);
  readonly loading = this.store.selectSignal(selectFilesLoading);
  readonly error = this.store.selectSignal(selectFilesError);

  ngOnInit(): void {
    this.store.dispatch(loadFiles())
  }

  toggleMaximize(isMaximized: boolean): void {
    if (isMaximized) {
      this.dialogRef.updateSize('100vw', '100vh');
    } else {
      this.dialogRef.updateSize('90vw', '80vh');
    }
  }

  selectFile(file: FileDTO) {
    this.dialogRef.close(file);
  }
}
