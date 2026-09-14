import { Component, computed, inject, signal } from '@angular/core';
import {
  CloseableDialogTitleComponent
} from "@shared-lib/components/closeable-dialog-title/closeable-dialog-title.component";
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogContent, MatDialogRef } from "@angular/material/dialog";
import {TranslatePipe, TranslateService} from "@ngx-translate/core";
import {JsonEditorComponent} from "@shared-lib/components/json-editor/json-editor.component";
import {ConnectorService} from "../../../../services/connector-crud.service";
import {ErrorCardComponent} from "@shared-lib/components/error-card/error-card.component";
import {ConnectorDTO} from "../../../../dto/connector";
import {MatSnackBar} from "@angular/material/snack-bar";
import {BtnComponent} from "@shared-lib/components/btn/btn.component";

export interface EditConnectorJsonEditorData {
  editable: boolean
  cohortId?: string;
  connector?: ConnectorDTO | undefined;
}

@Component({
  selector: 'app-connector-json-editor-dialog',
  imports: [
    CloseableDialogTitleComponent,
    TranslatePipe,
    BtnComponent,
    MatDialogActions,
    JsonEditorComponent,
    ErrorCardComponent,
    MatDialogContent
  ],
  templateUrl: './connector-json-editor-dialog.component.html',
  styleUrl: './connector-json-editor-dialog.component.scss',
})
export class ConnectorJsonEditorDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<ConnectorJsonEditorDialogComponent>);
  readonly data = inject<EditConnectorJsonEditorData | undefined>(MAT_DIALOG_DATA);
  private readonly connectorService: ConnectorService = inject(ConnectorService);
  private readonly translate: TranslateService = inject(TranslateService);
  private readonly snackBar = inject(MatSnackBar);

  protected readonly createMode = !this.data?.connector;
  protected readonly viewMode = !(this.data?.editable ?? false);

  protected readonly title = computed(() => {
    const name = this.data?.connector?.name;
    if (this.viewMode && name) {
      return this.translate.instant('DIALOG.CONNECTOR_JSON_VIEW.TITLE_NAMED', {name});
    }
    if (this.viewMode) {
      return this.translate.instant('DIALOG.CONNECTOR_JSON_VIEW.TITLE');
    }
    if (this.createMode) {
      return this.translate.instant('DIALOG.CONNECTOR_JSON_EDITOR.CREATE_TITLE');
    }
    return this.translate.instant('DIALOG.CONNECTOR_JSON_EDITOR.EDIT_TITLE', {name: name ?? ''});
  });

  protected readonly jsonText = computed(() => {
    const connector = this.connector();
    if (!connector) {
      return '';
    }
    return JSON.stringify(connector, null, 2);
  });

  cohortId = signal<string>(this.data?.cohortId ?? '');
  connector = signal<ConnectorDTO | undefined>(this.data?.connector);
  errorMessage = signal<string | undefined>(undefined);

  toggleMaximize(isMaximized: boolean): void {
    if (isMaximized) {
      this.dialogRef.updateSize('100vw', '100vh');
    } else {
      this.dialogRef.updateSize('90vw', '80vh');
    }
  }

  onJsonChanged(connector: ConnectorDTO): void {
    if (this.data?.editable) {
      const cohortId = this.cohortId();
      this.connector.set({
        ...connector,
        cohortId: cohortId ? Number(cohortId) : undefined,
      });
    }
  }

  create() {
    const c = this.connector();
    if (!c) {
      return;
    }
    this.connectorService.saveRaw(c).subscribe({
      next: data => {
        this.dialogRef.close(data);
      },
      error: error => {
        const errorMessage = this.getSaveErrorMessage(error);
        this.errorMessage.set(errorMessage);
      },
    });
  }

  update() {
    const c = this.connector();
    if (!c) {
      return;
    }
    this.connectorService.update(c).subscribe({
      next: data => {
        this.dialogRef.close(data);
      },
      error: error => {
        const errorMessage = this.getSaveErrorMessage(error);
        this.errorMessage.set(errorMessage);
      },
    });
  }

  async copyJson(): Promise<void> {
    const text = this.jsonText();
    if (!text) {
      return;
    }

    await navigator.clipboard.writeText(text);
    this.snackBar.open(
      this.translate.instant('DIALOG.CONNECTOR_JSON_VIEW.COPY_SUCCESS'),
      this.translate.instant('BUTTON.CLOSE'),
      {duration: 2500}
    );
  }

  downloadJson(): void {
    const connector = this.connector();
    const text = this.jsonText();
    if (!connector || !text) {
      return;
    }

    const blob = new Blob([text], {type: 'application/json'});
    const url = window.URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${connector.name || 'connector'}.json`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    window.URL.revokeObjectURL(url);
  }

  private getSaveErrorMessage(error: any): string {
    if (error?.error?.message) {
      return error.error.message;
    }

    return this.translate.instant('ERROR.SAVE_CONNECTOR_GENERIC');
  }
}
