import {Component, computed, effect, ElementRef, inject, input, output, signal, viewChild, ViewChild} from '@angular/core';
import {ConnectorDTO} from "../../../../dto/connector";
import {ConnectorStepConfigChangeEmitter} from "../../../../models/connector-step-config";
import {MatSnackBar} from "@angular/material/snack-bar";
import {
  ConnectorFileImportResultDTO,
  ConnectorFilesDTO,
  FileParsingSettingsDTO
} from "../../../../dto/upload-info";
import {
  ConnectorStepDataSourceMultiFileUploadComponent
} from "../../../manage-connector/components/config/input-file/components/multi-file/multi-file.component";
import {MatDialog} from "@angular/material/dialog";
import {TranslatePipe, TranslateService} from '@ngx-translate/core';
import {MatCheckbox} from '@angular/material/checkbox';
import {FormsModule} from '@angular/forms';
import {MatButton} from '@angular/material/button';
import {MatTooltip} from '@angular/material/tooltip';
import {MatIcon} from '@angular/material/icon';
import {ConfirmDialogComponent} from '@shared-lib/components/confirm-dialog/confirm-dialog.component';
import {isFileUploadSettings} from "../../../../helper/connector-config-helper";
import {
  InputAppBasedComponent
} from "../../../manage-connector/components/config/input-app-based/input-app-based.component";
import {ALLOWED_FILE_EXTENSIONS} from '../../../../constansts/allowed-file-extenstion.constants';
import {
  InputFileSelectDialogComponent
} from "../../../manage-connector/components/config/input-file/components/input-file-select-dialog/input-file-select-dialog.component";
import {
  FileImportComponent,
  FileImportResult
} from "../../../import/file-import/file-import.component";
import {ImportUploadSettings} from "../../../../dto/connector-import";
import {FileUploadSettings} from "../../../../models/input-config";

@Component({
  selector: 'app-run-new-file',
  templateUrl: './run-new-file.component.html',
  styleUrl: './run-new-file.component.scss',
  imports: [MatCheckbox, FormsModule, MatButton, MatTooltip, MatIcon, TranslatePipe, InputAppBasedComponent, FileImportComponent]
})
export class RunNewFileComponent {
  private readonly snackBar = inject(MatSnackBar);
  private readonly dialog: MatDialog = inject(MatDialog);
  private readonly translate: TranslateService = inject(TranslateService);

  readonly config = input<ConnectorDTO>({} as ConnectorDTO);
  readonly availableFiles = input<ConnectorFilesDTO[]>([]);
  readonly fileSettings = input<FileParsingSettingsDTO | undefined>(undefined);
  readonly isToolBased = computed(() => {
    const config = this.config();
    const inputConfig = config?.inputConfig;
    if (!inputConfig) {
      return false;
    }
    return inputConfig.mode === 'APP';
  });
  readonly uploadSuccess = output<number>();
  readonly uploadStateChange = output<boolean>();
  readonly save = output<ConnectorStepConfigChangeEmitter>();

  private pendingClick = false;

  newFile = signal<boolean>(false);
  isUploading = signal<boolean>(false);

  private readonly fileImport = viewChild(FileImportComponent);

  @ViewChild('fileInput')
  set fileInput(el: ElementRef<HTMLInputElement> | undefined) {
    if (!el) return;

    this._fileInput = el;

    if (this.pendingClick) {
      this.pendingClick = false;
      el.nativeElement.click();
    }
  }

  private _fileInput?: ElementRef<HTMLInputElement>;

  private readonly fileMissingEffect = effect(() => {
    if (this.config().inputConfig && isFileUploadSettings(this.config().inputConfig!)) {
      const isMissing = !(this.config().inputConfig as any)?.fileExists;

      if (isMissing) {
        this.openReuploadModal();
      }
    }
  });

  private readonly fileConfig = computed<FileUploadSettings | undefined>(() => {
    const inputConfig = this.config().inputConfig;
    return inputConfig && isFileUploadSettings(inputConfig) ? inputConfig : undefined;
  });

  private readonly currentFile = computed<ConnectorFilesDTO | undefined>(() => {
    const fileId = this.fileConfig()?.fileId;
    return fileId ? this.availableFiles().find(file => file.id === fileId) : undefined;
  });

  readonly importSettings = computed<ImportUploadSettings>(() => {
    const config = this.fileConfig();
    const parsing = this.fileSettings()
      ?? this.currentFile()?.uploadSettings
      ?? this.configuredParsing(config);
    if (!parsing) {
      return {};
    }
    return {
      fileType: parsing.fileType,
      delimiter: parsing.delimiter,
      customDelimiter: parsing.customDelimiter,
      hasHeader: parsing.hasHeader,
      firstSheetOnly: parsing.firstSheetOnly,
      hasSupportFile: config?.hasSupportFile,
      deleteUnneededFileAfterSuccess: config?.deleteUnneededFileAfterSuccess,
    };
  });

  private configuredParsing(config: FileUploadSettings | undefined): FileParsingSettingsDTO | undefined {
    if (!config?.fileType) {
      return undefined;
    }
    return {
      fileType: config.fileType === 'ZIP' ? 'MULTIPLE_CSV_ZIP' : config.fileType,
      delimiter: config.delimiter,
      customDelimiter: config.customDelimiter,
      hasHeader: config.hasHeader,
      firstSheetOnly: config.fileType === 'ZIP' ? false : config.firstSheetOnly,
    };
  }

  hasSelectableFiles(): boolean {
    return this.availableFiles().length > 1;
  }

  openUploadDialog() {
    this.dialog.open(ConnectorStepDataSourceMultiFileUploadComponent, {
      width: '400px',
      data: {cohort_id: this.config().cohortId}
    });
  }

  hasSupportFile(): boolean {
    const config = this.config();
    return !!(config
      && config.inputConfig
      && isFileUploadSettings(config.inputConfig)
      && config.inputConfig.hasSupportFile);
  }

  onFileSelected(event: Event): void {
    const config = this.config();
    if (!config.id) {
      console.error(this.translate.instant('ERROR.NO_CONNECTOR_ID'));
      this.snackBar.open(
        this.translate.instant('ERROR.NO_CONNECTOR_ID'),
        this.translate.instant('BUTTON.CLOSE'), {
          duration: 5000,
          verticalPosition: 'top',
        });
      return;
    }
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length <= 0) {
      this.setUploadState(false);
      console.error(this.translate.instant('ERROR.NO_FILES'));
      this.snackBar.open(
        this.translate.instant('ERROR.NO_FILES'),
        this.translate.instant('BUTTON.CLOSE'), {
          duration: 5000,
          verticalPosition: 'top',
        });
      return;
    }
    const file = input.files[0];
    const fileExtension = file.name.split('.').pop()?.toLowerCase();

    if (!fileExtension || !ALLOWED_FILE_EXTENSIONS.includes(`.${fileExtension}`)) {
      this.setUploadState(false);
      console.error(this.translate.instant('ERROR.ERROR_INVALID_FILE_TYPE'));
      this.snackBar.open(
        this.translate.instant('ERROR.ERROR_INVALID_FILE_TYPE_CSV_EXCEL_TXT'),
        this.translate.instant('BUTTON.CLOSE'), {
          duration: 5000,
          verticalPosition: 'top',
        });
      return;
    }
    this.setUploadState(true);
    this.fileImport()?.importFile(file);
  }


  onImportCompleted(result: FileImportResult): void {
    this.setUploadState(false);
    const response = result.result as ConnectorFileImportResultDTO | undefined;
    if (!response?.accepted) {
      return;
    }
    this.snackBar.open(
      this.translate.instant('FILE_IMPORTED_SUCCESSFULLY'),
      this.translate.instant('BUTTON.CLOSE'), {
        duration: 5000,
        verticalPosition: 'top',
        horizontalPosition: 'end'
      });
    const importedFile = response.files?.[0];
    if (importedFile?.id) {
      this.uploadSuccess.emit(importedFile.id);
    }
  }

  onImportFailed(message: string): void {
    this.setUploadState(false);
    console.error(this.translate.instant('ERROR.ERROR_IMPORTING_FILE') + ': ' + message);
    this.snackBar.open(
      this.translate.instant('ERROR.ERROR_OCCURRED_PLEASE_TRY_AGAIN'),
      this.translate.instant('BUTTON.CLOSE'), {
        duration: 5000,
        verticalPosition: 'top',
      });
  }

  openFileSelectionDialog(): void {
    const inputConfig = this.config().inputConfig;
    const dialogRef = this.dialog.open(InputFileSelectDialogComponent, {
      data: {
        files: this.availableFiles(),
        selectedFileId: inputConfig && 'fileId' in inputConfig ? inputConfig.fileId ?? null : null,
      },
    });

    dialogRef.afterClosed().subscribe((selectedFile?: ConnectorFilesDTO) => {
      if (!selectedFile || !inputConfig || !('fileId' in inputConfig)) {
        return;
      }

      this.fileImport()?.dismiss();
      this.uploadSuccess.emit(selectedFile.id);
    });
  }

  private openReuploadModal(): void {
    const inputConfig = this.config().inputConfig;
    const fileName = inputConfig && 'fileName' in inputConfig ? inputConfig.fileName : '';
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: this.translate.instant('DIALOG.REUPLOAD_MODAL.TITLE'),
        message: this.translate.instant('DIALOG.REUPLOAD_MODAL.MESSAGE', { fileName: fileName }),
        dismissButtonText: this.translate.instant('BUTTON.CANCEL'),
        confirmButtonText: this.translate.instant('BUTTON.UPLOAD'),
      },
    });

    dialogRef.afterClosed().subscribe((upload: true | false) => {
      if (upload) {
        this.triggerNewFileUpload();
      }
    });
  }

  private triggerNewFileUpload(): void {
    this.newFile.set(true);

    if (this._fileInput) {
      this._fileInput.nativeElement.click();
    } else {
      this.pendingClick = true;
    }
  }

  private setUploadState(uploading: boolean): void {
    this.isUploading.set(uploading);
    this.uploadStateChange.emit(uploading);
  }
}
