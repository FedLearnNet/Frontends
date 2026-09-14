import {Component, effect, inject, signal} from '@angular/core';
import {
  FileDetailCardComponent
} from "@shared-lib/modules/files/components/file-detail-card/file-detail-card.component";
import {DecimalPipe} from "@angular/common";
import {Store} from "@ngrx/store";
import {selectFilesError, selectFilesLoading, selectSelectedFile} from "@shared-lib/modules/files/store/file.selectors";
import {FormsModule} from "@angular/forms";
import {MatFormField, MatInput, MatLabel, MatSuffix} from "@angular/material/input";
import {MatIcon} from "@angular/material/icon";
import {MatIconButton} from "@angular/material/button";
import {deleteFile, downloadFile, renameFile} from "@shared-lib/modules/files/store/file.actions";
import {FileRenameDTO} from "@shared-lib/modules/files/dto/file";
import {HeaderComponent} from "@shared-lib/components/header/header.component";
import {PageWrapperComponent} from "@shared-lib/components/page-wrapper/page-wrapper.component";
import {BadgeComponent} from "@shared-lib/components/badge/badge.component";
import {MatTooltip} from "@angular/material/tooltip";
import {ConfirmDialogComponent} from "@shared-lib/components/confirm-dialog/confirm-dialog.component";
import {MatDialog} from "@angular/material/dialog";
import {TranslateService} from "@ngx-translate/core";

@Component({
  selector: 'app-file-detail-component',
  imports: [
    FileDetailCardComponent,
    DecimalPipe,
    FormsModule,
    MatFormField,
    MatIcon,
    MatIconButton,
    MatInput,
    MatLabel,
    MatSuffix,
    BadgeComponent,
    MatTooltip,
    HeaderComponent,
    PageWrapperComponent,
  ],
  templateUrl: './file-detail-component.component.html',
  styleUrl: './file-detail-component.component.scss',
})
export class FileDetailComponentComponent {
  private readonly store: Store = inject(Store);
  private readonly translate: TranslateService = inject(TranslateService);
  private readonly dialog: MatDialog = inject(MatDialog);

  readonly file = this.store.selectSignal(selectSelectedFile);
  readonly loading = this.store.selectSignal(selectFilesLoading);
  readonly error = this.store.selectSignal(selectFilesError);

  fileName = signal<string | undefined>(undefined);
  isEditing = signal<boolean>(false);

  initFileNameEffect = effect(() => this.cancelEditing());

  toggleEditing(): void {
    this.isEditing.update(b => !b);
  }

  saveFileName(): void {
    const fileName = this.fileName()?.trim();
    const file = this.file();
    if (file && fileName && fileName !== this.file()?.fileName) {
      this.store.dispatch(renameFile({
        id: file.id,
        secret: file.secret,
        dto: {
          fileName: fileName
        } as FileRenameDTO
      }));
    }
    this.fileName.set(this.file()?.fileName);
  }

  deleteFile(): void {
    const file = this.file();
    if (!file) {
      return;
    }
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: this.translate.instant('DIALOG.DELETE_FILE.TITLE'),
        message: this.translate.instant('DIALOG.DELETE_FILE.MESSAGE'),
        dismissButtonText: this.translate.instant('BUTTON.CANCEL'),
        confirmButtonText: this.translate.instant('BUTTON.DELETE'),
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (!result) return;
      this.store.dispatch(deleteFile({
        id: file.id,
        secret: file.secret,
      }));
    });

  }

  downloadFile(): void {
    const file = this.file();
    if (!file) {
      return;
    }
    this.store.dispatch(downloadFile({
      id: file.id,
      secret: file.secret,
    }));
  }

  cancelEditing(): void {
    this.fileName.set(this.file()?.fileName);
    this.isEditing.set(false);
  }

}
