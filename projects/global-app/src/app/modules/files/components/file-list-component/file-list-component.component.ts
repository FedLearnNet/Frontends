import {Component, inject, signal} from '@angular/core';
import {Store} from "@ngrx/store";
import {
  selectAllFiles,
  selectCurrentGlobalUpload,
  selectFilesError,
  selectFilesLoading
} from "@shared-lib/modules/files/store/file.selectors";
import {ErrorCardComponent} from "@shared-lib/components/error-card/error-card.component";
import {FileCardComponent} from "@shared-lib/modules/files/components/file-card/file-card.component";
import {RouterLink} from "@angular/router";
import {
  UploadFileAreaComponent
} from "@shared-lib/modules/files/components/upload-file-area/upload-file-area.component";
import {uploadFile} from "@shared-lib/modules/files/store/file.actions";
import {HeaderComponent} from "@shared-lib/components/header/header.component";

@Component({
  selector: 'app-file-list-component',
  imports: [
    ErrorCardComponent,
    FileCardComponent,
    RouterLink,
    UploadFileAreaComponent,
    HeaderComponent
  ],
  templateUrl: './file-list-component.component.html',
  styleUrl: './file-list-component.component.scss',
})
export class FileListComponentComponent {
  private readonly store: Store = inject(Store);

  readonly files = this.store.selectSignal(selectAllFiles);
  readonly loading = this.store.selectSignal(selectFilesLoading);
  readonly error = this.store.selectSignal(selectFilesError);

  currentUpload = this.store.selectSignal(selectCurrentGlobalUpload);
  showUpload = signal<boolean>(false);

  uploadFile(file: File): void {
    this.store.dispatch(uploadFile({file}));
  }

  toggleUpload(): void {
    this.showUpload.update(u => !u);
  }
}
