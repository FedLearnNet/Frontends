import {Component, computed, inject, signal} from '@angular/core';
import {
  CloseableDialogTitleComponent
} from '@shared-lib/components/closeable-dialog-title/closeable-dialog-title.component';
import {ErrorCardComponent} from '@shared-lib/components/error-card/error-card.component';
import {InfoCardComponent} from '@shared-lib/components/info-card/info-card.component';
import {JsonEditorComponent} from '@shared-lib/components/json-editor/json-editor.component';
import {MAT_DIALOG_DATA, MatDialogActions, MatDialogContent, MatDialogRef} from '@angular/material/dialog';
import {MatFormField, MatHint, MatInput, MatLabel} from '@angular/material/input';
import {FormsModule} from '@angular/forms';
import {TranslatePipe, TranslateService} from '@ngx-translate/core';
import {ConnectorService} from '../../../../services/connector-crud.service';
import {ConnectorDTO} from '../../../../dto/connector';
import {BtnComponent} from '@shared-lib/components/btn/btn.component';

export type ConnectorImportMethod = 'url' | 'json';

export interface ConnectorImportDialogData {
  cohortId: string;
}

@Component({
  selector: 'app-connector-import-dialog',
  imports: [
    CloseableDialogTitleComponent,
    ErrorCardComponent,
    InfoCardComponent,
    JsonEditorComponent,
    MatDialogActions,
    MatDialogContent,
    BtnComponent,
    MatFormField,
    MatHint,
    MatLabel,
    MatInput,
    FormsModule,
    TranslatePipe,
  ],
  templateUrl: './connector-import-dialog.component.html',
  styleUrl: './connector-import-dialog.component.scss',
})
export class ConnectorImportDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<ConnectorImportDialogComponent>);
  private readonly connectorService = inject(ConnectorService);
  private readonly translate = inject(TranslateService);
  readonly data = inject<ConnectorImportDialogData>(MAT_DIALOG_DATA);

  private readonly cohortId = this.data.cohortId;

  protected readonly importMethod = signal<ConnectorImportMethod>('json');
  protected readonly errorMessage = signal<string | undefined>(undefined);
  protected readonly url = signal<string | undefined>(undefined);
  protected readonly connector = signal<ConnectorDTO | undefined>(undefined);
  protected readonly jsonFileContent = signal<string | undefined>(undefined);
  protected readonly jsonFileName = signal<string | undefined>(undefined);

  protected readonly urlValid = computed(() => {
    const value = this.url();
    if (!value) {
      return false;
    }
    if (value.startsWith('https://') || value.startsWith('http://')) {
      return true;
    }
    if (value.startsWith('file:///')) {
      return true;
    }
    return value.startsWith('/');
  });

  protected readonly canCreate = computed(() => {
    if (this.importMethod() === 'url') {
      return this.urlValid();
    }
    return !!this.connector();
  });

  toggleMaximize(isMaximized: boolean): void {
    if (isMaximized) {
      this.dialogRef.updateSize('100vw', '100vh');
    } else {
      this.dialogRef.updateSize('90vw', '80vh');
    }
  }

  onMethodChange(method: ConnectorImportMethod): void {
    this.importMethod.set(method);
    this.errorMessage.set(undefined);
  }

  onJsonChanged(connector: ConnectorDTO): void {
    this.connector.set({
      ...connector,
      cohortId: Number(this.cohortId),
    });
  }

  onJsonFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const content = typeof reader.result === 'string' ? reader.result : '';
      this.jsonFileName.set(file.name);

      if (content !== this.jsonFileContent()) {
        this.connector.set(undefined);
        this.jsonFileContent.set(content);
      }

      input.value = '';
    };
    reader.onerror = () => {
      this.errorMessage.set(this.translate.instant('DIALOG.CONNECTOR_IMPORT.JSON_FILE_READ_ERROR'));
      input.value = '';
    };
    reader.readAsText(file);
  }

  create(): void {
    this.errorMessage.set(undefined);

    if (this.importMethod() === 'url') {
      this.createFromUrl();
      return;
    }

    this.createFromJson();
  }

  private createFromUrl(): void {
    if (!this.urlValid()) {
      return;
    }

    this.connectorService.saveViaURL(this.url()!, this.cohortId).subscribe({
      next: data => this.dialogRef.close(data),
      error: error => this.errorMessage.set(this.getSaveErrorMessage(error)),
    });
  }

  private createFromJson(): void {
    const connector = this.connector();
    if (!connector) {
      this.errorMessage.set(this.translate.instant('DIALOG.CONNECTOR_IMPORT.JSON_APPLY_REQUIRED'));
      return;
    }

    this.connectorService.saveRaw(connector).subscribe({
      next: data => this.dialogRef.close(data),
      error: error => this.errorMessage.set(this.getSaveErrorMessage(error)),
    });
  }

  private getSaveErrorMessage(error: any): string {
    if (error?.error?.message) {
      return error.error.message;
    }

    return this.translate.instant('ERROR.SAVE_CONNECTOR_GENERIC');
  }
}
