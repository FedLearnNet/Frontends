import {
  ChangeDetectorRef,
  Component,
  computed,
  inject,
  input,
  model,
  OnInit,
  output,
  signal
} from '@angular/core';
import {ConnectorStepConfig, ConnectorStepConfigChangeEmitter} from "../../../../../models/connector-step-config";
import {FileUploadSettings} from "../../../../../models/input-config";
import {ConnectorUploadService} from "../../../../../services/connector-upload.service";
import {MatSnackBar} from "@angular/material/snack-bar";
import {MatDialog} from "@angular/material/dialog";
import {ConnectorStepDataSourceMultiFileUploadComponent} from "./components/multi-file/multi-file.component";
import {TranslatePipe, TranslateService} from '@ngx-translate/core';
import {MatCard, MatCardFooter} from '@angular/material/card';
import {MatIcon} from '@angular/material/icon';
import {MatTooltip} from '@angular/material/tooltip';
import {MatButton} from '@angular/material/button';
import {RunNewFileComponent} from '../../../../run-connector/components/run-new-file/run-new-file.component';
import {ConnectorFilesDTO, UploadInfoDTO} from '../../../../../dto/upload-info';
import {
  connectorFilesDetailToFileInfo,
  isFileUploadSettings
} from "../../../../../helper/connector-config-helper";
import {ConnectorDTO} from "../../../../../dto/connector";
import {InputFileSelectDialogComponent} from "./components/input-file-select-dialog/input-file-select-dialog.component";
import {BadgeComponent} from '@shared-lib/components/badge/badge.component';
import {KvComponent} from '@shared-lib/components/kv/kv.component';
import {RouterLink} from "@angular/router";
import {
  FileUploadDialogSettings,
  InputFileUploadDialogComponent,
  InputFileUploadDialogResult
} from './components/input-file-upload-dialog/input-file-upload-dialog.component';

@Component({
  selector: 'app-input-file',
  templateUrl: './input-file.component.html',
  styleUrl: './input-file.component.scss',
  imports: [MatCard, MatIcon, MatTooltip, MatButton, RunNewFileComponent, MatCardFooter, TranslatePipe, BadgeComponent, KvComponent, RouterLink]
})
export class ConnectorStepDataSourceInputFileConfigComponent implements OnInit, ConnectorStepConfig<ConnectorDTO> {
  private uploadService = inject(ConnectorUploadService);
  private snackBar = inject(MatSnackBar);
  dialog = inject(MatDialog);
  private cdr = inject(ChangeDetectorRef);
  private translate = inject(TranslateService);

  readonly cohortId = input<number>();
  readonly config = model<ConnectorDTO>({} as ConnectorDTO);
  connectorExist = computed(() => {
    const config = this.config();
    return !!(config &&
      config?.cohortId &&
      config?.id);
  });
  readonly configChange = output<ConnectorDTO>();

  readonly save = output<ConnectorStepConfigChangeEmitter>();

  readonly hasNoFileUploaded = computed(() => {
    const config = this.config().inputConfig;
    return isFileUploadSettings(config!) && !config.fileId && config.fileExists === false;
  });

  public settings: FileUploadSettings = {
    mode: 'FILE',
    file: null,
    fileType: 'CSV',
    delimiter: ',',
    hasHeader: true,
    firstSheetOnly: true,
    deleteUnneededFileAfterSuccess: true
  };

  availableFiles = signal<ConnectorFilesDTO[]>([]);
  selectedFile = signal<ConnectorFilesDTO | undefined>(undefined);
  readonly availableFileCount = computed(() => this.availableFiles().length);
  readonly currentFileName = computed(() => this.selectedFile()?.fileName ?? this.settings.file?.name ?? null);

  ngOnInit(): void {
    const input = this.config()?.inputConfig;
    if (input && isFileUploadSettings(input)) {
      // Break reference to parent config; keep local mutable copy.
      this.settings = {...input};
    }

    this.loadAvailableFiles();

    if (this.hasNoFileUploaded()) {
      this.openPrimaryFileUploadDialog();
    }
  }

  getCohortId(): number | undefined {
    return this.config().cohortId ?? this.cohortId();
  }

  private loadAvailableFiles(cohortId = this.getCohortId()): void {
    if (!cohortId) {
      return;
    }

    if (this.selectedFile() && this.availableFiles().find(file => file.id === this.selectedFile()?.id)) {
      return;
    }

    this.uploadService.getFiles(cohortId).subscribe(files => {
      this.availableFiles.set(files.filter(file => !file.isSupportFile));

      const inputConfig = this.config().inputConfig;
      if (inputConfig && inputConfig.fileId) {
        this.selectedFile.set(this.availableFiles().find(file => file.id === inputConfig.fileId));
      }
    });
  }

  hasSelectableFiles(): boolean {
    return this.availableFiles().length > 0;
  }

  getDelimiterLabel(): string {
    if (this.settings.delimiter === 'CUSTOM') {
      return this.settings.customDelimiter || 'Custom';
    }
    if (this.settings.delimiter === '\t') {
      return 'Tab';
    }
    if (this.settings.delimiter === 's') {
      return 'Space';
    }
    return this.settings.delimiter;
  }

  openPrimaryFileUploadDialog(): void {
    const cohortId = this.getCohortId();
    if (cohortId === undefined) {
      this.snackBar.open(
        this.translate.instant('ERROR.CORRUPT_CONFIG'),
        this.translate.instant('BUTTON.CLOSE'),
        {duration: 5000, verticalPosition: 'top'},
      );
      return;
    }

    const dialogRef = this.dialog.open(InputFileUploadDialogComponent, {
      width: 'min(1100px, 96vw)',
      maxWidth: '96vw',
      maxHeight: '92vh',
      autoFocus: false,
      data: {
        cohortId,
        settings: this.uploadDialogSettings(),
      },
    });

    dialogRef.afterClosed().subscribe((result?: InputFileUploadDialogResult) => {
      if (result) {
        this.applyUploadedFile(result);
      }
    });
  }


  private uploadDialogSettings(): FileUploadDialogSettings {
    const stored = this.selectedFile()?.uploadSettings;
    const archive = stored?.fileType === 'MULTIPLE_CSV_ZIP';
    const storedType: FileUploadSettings['fileType'] | undefined =
      stored?.fileType === 'MULTIPLE_CSV_ZIP' ? 'CSV' : stored?.fileType;
    return {
      fileType: storedType ?? this.settings.fileType,
      delimiter: stored?.delimiter ?? this.settings.delimiter,
      customDelimiter: stored?.customDelimiter ?? this.settings.customDelimiter,
      hasHeader: stored?.hasHeader ?? this.settings.hasHeader,
      firstSheetOnly: archive ? false : stored?.firstSheetOnly ?? this.settings.firstSheetOnly,
      hasSupportFile: this.settings.hasSupportFile,
      deleteUnneededFileAfterSuccess: this.settings.deleteUnneededFileAfterSuccess,
    };
  }

  private applyUploadedFile(result: InputFileUploadDialogResult): void {
    const uploadedFile = result.uploadedFile;
    this.settings = {
      ...this.settings,
      ...result.settings,
      file: null,
      fileId: uploadedFile.id,
      fileExists: true,
    };
    this.selectedFile.set(uploadedFile);
    this.loadAvailableFiles();
    this.cdr.detectChanges();

    const fileInfo = connectorFilesDetailToFileInfo(uploadedFile);
    this.configChange.emit({
      ...this.config(),
      inputConfig: {...this.settings},
      fileInfo,
      uploadInfo: fileInfo,
    });
  }

  onContinueClick(): boolean {
    if (!this.settings.fileId) {
      this.snackBar.open(
        this.translate.instant('WARNING.PLEASE_IMPORT_A_FILE'),
        this.translate.instant('BUTTON.CLOSE'), {
          duration: 5000,
          verticalPosition: 'top',
        });
      return false;
    }

    this.config.set({
      ...this.config(),
      inputConfig: {...this.settings},
    });
    this.configChange.emit(this.config());
    return true;
  }

  openUploadDialog() {
    this.dialog.open(ConnectorStepDataSourceMultiFileUploadComponent, {
      width: '400px',
      data: {cohortId: this.getCohortId()}
    });
  }

  openFileSelectionDialog(): void {
    const dialogRef = this.dialog.open(InputFileSelectDialogComponent, {
      width: 'min(960px, 92vw)',
      maxWidth: '92vw',
      data: {
        files: this.availableFiles(),
        selectedFileId: this.settings.fileId ?? null,
      },
    });

    dialogRef.afterClosed().subscribe((selectedFile?: ConnectorFilesDTO) => {
      if (!selectedFile) {
        return;
      }

      const uploadSettings = selectedFile.uploadSettings;
      this.settings = {
        ...this.settings,
        ...(uploadSettings ? {
          fileType: uploadSettings.fileType === 'MULTIPLE_CSV_ZIP' ? 'CSV' : uploadSettings.fileType,
          delimiter: uploadSettings.delimiter,
          customDelimiter: uploadSettings.customDelimiter,
          hasHeader: uploadSettings.hasHeader,
          firstSheetOnly: uploadSettings.firstSheetOnly,
        } : {}),
        file: null,
        fileExists: true,
        fileId: selectedFile.id,
      };

      this.configChange.emit({
        ...this.config(),
        inputConfig: {...this.settings},
      });

      this.selectedFile.set(selectedFile);
      this.cdr.detectChanges();
    });
  }

  onUploadSucceeded(fileId: number): void {
    this.settings.file = null;
    this.settings.fileId = fileId;
    this.selectedFile.set(this.availableFiles().find(file => file.id === fileId));

    let configTmp = this.config();
    const updatedFileInfo: Record<string, UploadInfoDTO> = {};
    const currentInputConfig = this.config().inputConfig;
    if (fileId) {
      configTmp = {
        ...this.config(),
        inputConfig: {
          ...currentInputConfig,
          fileId: fileId,
          fileExists: true,
        } as FileUploadSettings,
      };
    }

    if (configTmp) {
      Object.entries(configTmp.fileInfo ?? {}).forEach(([sheetName, info]) => {
        updatedFileInfo[sheetName] = {
          ...info,
          fileExists: true
        };
      });
    }

    this.configChange.emit({
      ...configTmp,
      fileInfo: updatedFileInfo,
    });

    this.loadAvailableFiles();
  }

}
