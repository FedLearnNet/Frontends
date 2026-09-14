import {DecimalPipe} from '@angular/common';
import {TranslatePipe} from '@ngx-translate/core';
import {Component, computed, inject, signal, viewChild} from '@angular/core';
import {FormBuilder, ReactiveFormsModule} from '@angular/forms';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogContent,
  MatDialogRef
} from '@angular/material/dialog';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatRadioModule} from '@angular/material/radio';
import {MatSelectModule} from '@angular/material/select';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {MatTabsModule} from '@angular/material/tabs';

import {BadgeComponent} from '@shared-lib/components/badge/badge.component';
import {BtnComponent} from '@shared-lib/components/btn/btn.component';
import {CloseableDialogTitleComponent} from '@shared-lib/components/closeable-dialog-title/closeable-dialog-title.component';
import {InfoCardComponent} from '@shared-lib/components/info-card/info-card.component';
import {
  FileImportComponent,
  FileImportResult
} from '../../../../../../import/file-import/file-import.component';
import {ImportSheetDTO} from '../../../../../../../dto/import-progress';
import {ImportUploadSettings} from '../../../../../../../dto/connector-import';
import {Store} from '@ngrx/store';
import {adoptableImport, selectAllImports} from '../../../../../../../store/import/import.selectors';
import {
  ALLOWED_ARCHIVE_EXTENSIONS,
  ALLOWED_FILE_EXTENSIONS
} from '../../../../../../../constansts/allowed-file-extenstion.constants';
import {FileUploadSettings} from '../../../../../../../models/input-config';
import {ConnectorFilesDetailDTO} from '../../../../../../../dto/upload-info';
import {
  ConnectorFileSheetDetailCardComponent,
  ConnectorFileSheetView
} from '../../../../../../file-detail/components/connector-file-sheet-detail-card/connector-file-sheet-detail-card.component';

export type FileUploadDialogSettings = Pick<
  FileUploadSettings,
  'fileType'
  | 'delimiter'
  | 'customDelimiter'
  | 'hasHeader'
  | 'firstSheetOnly'
  | 'hasSupportFile'
  | 'deleteUnneededFileAfterSuccess'
>;

export interface InputFileUploadDialogData {
  cohortId: number;
  settings: FileUploadDialogSettings;
}

export interface InputFileUploadDialogResult {
  uploadedFile: ConnectorFilesDetailDTO;
  settings: FileUploadDialogSettings;
}

@Component({
  selector: 'app-input-file-upload-dialog',
  imports: [
    DecimalPipe,
    ReactiveFormsModule,
    MatDialogContent,
    MatDialogActions,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatRadioModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatTabsModule,
    FileImportComponent,
    InfoCardComponent,
    BadgeComponent,
    BtnComponent,
    CloseableDialogTitleComponent,
    ConnectorFileSheetDetailCardComponent,
    TranslatePipe,
  ],
  templateUrl: './input-file-upload-dialog.component.html',
  styleUrl: './input-file-upload-dialog.component.scss',
})
export class InputFileUploadDialogComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly store = inject(Store);
  readonly dialogRef = inject(MatDialogRef<InputFileUploadDialogComponent, InputFileUploadDialogResult>);
  readonly data = inject<InputFileUploadDialogData>(MAT_DIALOG_DATA);

  private readonly fileImport = viewChild.required(FileImportComponent);

  /**
   * The import this dialog was closed on, if it is still worth showing. The dialog is destroyed when
   * it closes; the import is not, so reopening picks up where it left off rather than at the start.
   */
  private readonly resumed = adoptableImport(
    this.store.selectSignal(selectAllImports)(), this.data.cohortId, undefined);

  readonly file = signal<File | undefined>(undefined);
  readonly fileError = signal<string | undefined>(undefined);
  readonly analysisError = signal<string | undefined>(undefined);
  readonly analyzing = signal(this.resumed !== undefined && this.resumed.finishedAt === undefined);
  readonly uploadedFile = signal<ConnectorFilesDetailDTO | undefined>(
    this.resumed?.result?.files?.[0]);
  readonly submittedSettings = signal<FileUploadDialogSettings | undefined>(undefined);
  readonly acceptedExtensions = ALLOWED_FILE_EXTENSIONS.join(',');

  readonly analyzedSheets = computed<ConnectorFileSheetView[]>(() => {
    const detail = this.uploadedFile();
    const sheets: ImportSheetDTO[] = detail?.uploadInfo ?? [];
    const fileName = detail?.fileName ?? this.file()?.name;
    return sheets.map((sheet, index) => this.toSheetView(sheet, index, sheets.length, fileName));
  });

  readonly hasSheets = computed(() => this.analyzedSheets().length > 0);

  /** Once the import is under way the settings are fixed, so the form gives way to the progress. */
  readonly started = computed(() => this.analyzing() || this.uploadedFile() !== undefined);

  constructor() {
    // An import already under way settled these when it started; the form is a record of it until
    // it ends, not something to be changed underneath it.
    if (this.analyzing()) {
      this.form.disable();
    }
  }

  readonly form = this.formBuilder.nonNullable.group({
    fileType: [this.data.settings.fileType],
    delimiter: [this.data.settings.delimiter],
    customDelimiter: [this.data.settings.customDelimiter ?? ''],
    hasHeader: [this.data.settings.hasHeader],
    firstSheetOnly: [this.data.settings.firstSheetOnly],
    hasSupportFile: [this.data.settings.hasSupportFile ?? false],
    deleteUnneededFileAfterSuccess: [this.data.settings.deleteUnneededFileAfterSuccess ?? true],
  });

  selectFile(file: File): void {
    if (this.analyzing()) {
      return;
    }
    if (!this.isAllowedFile(file)) {
      this.file.set(undefined);
      this.fileError.set('Choose a CSV, text, JSON, Excel, or supported archive file.');
      return;
    }

    this.file.set(file);
    this.fileError.set(undefined);
    this.applyDetectedSettings(file);
  }

  clearFile(): void {
    if (this.analyzing()) {
      return;
    }
    this.file.set(undefined);
    this.fileError.set(undefined);
    this.fileImport().clear();
  }

  cancel(): void {
    this.fileImport().cancel();
    this.dialogRef.close();
  }

  close(): void {
    this.dialogRef.close();
  }

  submit(): void {
    if (!this.file() || this.form.invalid) {
      return;
    }

    this.analysisError.set(undefined);
    this.submittedSettings.set(this.dialogSettings(this.form.getRawValue()));
    this.analyzing.set(true);
    this.form.disable();
    this.fileImport().start();
  }

  importSettings(): ImportUploadSettings {
    const value = this.form.getRawValue();
    const archive = (this.file()?.name ?? '').toLocaleLowerCase().endsWith('.zip');
    return {
      fileType: archive ? 'MULTIPLE_CSV_ZIP' : value.fileType,
      delimiter: value.delimiter,
      customDelimiter: value.customDelimiter,
      hasHeader: value.hasHeader,
      firstSheetOnly: archive ? false : value.firstSheetOnly,
      hasSupportFile: value.hasSupportFile,
      deleteUnneededFileAfterSuccess: value.deleteUnneededFileAfterSuccess,
      supportFile: false,
      previewRows: 10,
    };
  }

  onImportCompleted(result: FileImportResult): void {
    this.analyzing.set(false);
    this.uploadedFile.set(result.result.files[0] as ConnectorFilesDetailDTO | undefined);
  }

  onImportFailed(message: string): void {
    this.analyzing.set(false);
    this.form.enable();
    this.analysisError.set(
      message || 'The file could not be analyzed with these settings. Review the configuration and try again.'
    );
  }

  useUploadedFile(): void {
    const uploadedFile = this.uploadedFile();
    if (!uploadedFile) {
      return;
    }
    this.fileImport().dismiss();
    this.dialogRef.close({
      uploadedFile,
      settings: this.submittedSettings() ?? this.dialogSettings(this.form.getRawValue()),
    });
  }

  private dialogSettings(value: typeof this.form.value): FileUploadDialogSettings {
    return {
      fileType: value.fileType!,
      delimiter: value.delimiter!,
      customDelimiter: value.delimiter === 'CUSTOM' ? value.customDelimiter : undefined,
      hasHeader: value.hasHeader!,
      firstSheetOnly: value.firstSheetOnly!,
      hasSupportFile: value.hasSupportFile!,
      deleteUnneededFileAfterSuccess: value.deleteUnneededFileAfterSuccess!,
    };
  }


  private toSheetView(
    sheet: ImportSheetDTO,
    index: number,
    total: number,
    fileName: string | undefined,
  ): ConnectorFileSheetView {
    const rows = this.parseSheetRows(sheet.json);
    const columnProfiles = sheet.columnProfiles ?? [];
    return {
      name: this.sheetName(sheet, index, total, fileName),
      rows,
      columns: sheet.columns ?? [],
      columnProfiles,
      rowsScanned: columnProfiles.reduce(
        (maximum, profile) => Math.max(maximum, profile.count ?? 0),
        rows.length,
      ),
      missingValues: columnProfiles.reduce((sum, profile) => sum + (profile.missing ?? 0), 0),
    };
  }

  private sheetName(
    sheet: ImportSheetDTO,
    index: number,
    total: number,
    fileName: string | undefined,
  ): string {
    const detected = sheet.sheet?.trim();
    const isPlaceholder = total === 1 && (!detected || detected === String(index));
    if (isPlaceholder) {
      return fileName ?? String(index);
    }
    return detected || fileName || String(index);
  }

  private parseSheetRows(json: string | undefined): Record<string, unknown>[] {
    if (!json) {
      return [];
    }
    try {
      const parsed = JSON.parse(json);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  private isAllowedFile(file: File): boolean {
    const fileName = file.name.toLocaleLowerCase();
    return ALLOWED_FILE_EXTENSIONS.some(extension => fileName.endsWith(extension));
  }

  private applyDetectedSettings(file: File): void {
    const fileName = file.name.toLocaleLowerCase();
    if (fileName.endsWith('.xls') || fileName.endsWith('.xlsx')) {
      this.form.patchValue({fileType: 'EXCEL'});
      return;
    }
    if (fileName.endsWith('.json')) {
      this.form.patchValue({fileType: 'JSON'});
      return;
    }

    const delimiter = fileName.endsWith('.tsv') || fileName.endsWith('.tab')
      ? '\t'
      : fileName.endsWith('.psv') ? '|' : this.form.controls.delimiter.value;
    const isArchive = ALLOWED_ARCHIVE_EXTENSIONS.some(extension => fileName.endsWith(extension));
    this.form.patchValue({fileType: 'CSV', delimiter, firstSheetOnly: !isArchive});
  }
}
