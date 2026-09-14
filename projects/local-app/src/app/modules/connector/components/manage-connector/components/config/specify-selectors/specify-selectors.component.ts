import {ChangeDetectorRef, Component, inject, input, model, OnInit, output, signal} from '@angular/core';
import {ConnectorStepConfig, ConnectorStepConfigChangeEmitter} from "../../../../../models/connector-step-config";
import {
  connectorFilesDetailToFileInfo,
  isAppBasedUploadSettings,
  isFileUploadSettings,
  mergeFileInfo
} from "../../../../../helper/connector-config-helper";
import {AppBasedUploadSettings} from "../../../../../models/input-config";
import {ConnectorUploadService} from "../../../../../services/connector-upload.service";
import {MatSnackBar} from "@angular/material/snack-bar";
import {catchError, finalize, forkJoin, map, of} from "rxjs";
import {
  ConnectorFilesDetailDTO,
  ConnectorFileUploadInfoDTO,
  UploadInfoDialog,
  UploadInfoDTO,
  UploadInfoView
} from "../../../../../dto/upload-info";
import {MatDialog} from "@angular/material/dialog";
import {MatTabsModule} from "@angular/material/tabs";
import {ConnectorStepSpecifySelectorsChangeNameComponent} from "./components/change-name/change-name.component";
import {TranslatePipe, TranslateService} from '@ngx-translate/core';
import {ConnectorDynamicTableComponent} from '../../table/dynamic-table/dynamic-table.component';
import {MatButton, MatIconButton} from '@angular/material/button';
import {MergeSheetsDialogComponent} from './components/merge-sheets/merge-sheets.component';
import {AppBasedExtractorComponent} from "./components/app-based-extractor/app-based-extractor.component";
import {ConnectorDTO, PivotConfigDTO, SheetMergeResultDTO} from "../../../../../dto/connector";
import {MatIcon} from "@angular/material/icon";
import {MatTooltip} from "@angular/material/tooltip";
import {ConnectorFileInfoDialogComponent} from "./components/file-info-dialog/file-info-dialog.component";
import {ConnectorPreviewService} from "../../../../../services/connector-preview.service";
import {configToConnectorConfigDTO} from "../../../../../models/connector-config";
import {
  PivotTableDialogComponent,
  PivotTableDialogResult
} from "../pivot-table-dialog/pivot-table-dialog.component";
import {BtnComponent} from "@shared-lib/components/btn/btn.component";
import {InfoCardComponent} from "@shared-lib/components/info-card/info-card.component";

@Component({
  selector: 'app-specify-selectors',
  templateUrl: './specify-selectors.component.html',
  styleUrl: './specify-selectors.component.scss',
  imports: [
    ConnectorDynamicTableComponent,
    MatButton,
    TranslatePipe,
    MatTabsModule,
    AppBasedExtractorComponent,
    MatIconButton,
    MatIcon,
    MatTooltip,
    BtnComponent,
    InfoCardComponent
  ]
})
export class ConnectorStepSpecifySelectorsComponent implements ConnectorStepConfig<ConnectorDTO>, OnInit {
  private uploadService = inject(ConnectorUploadService);
  private snackBar = inject(MatSnackBar);
  private cdr = inject(ChangeDetectorRef);
  dialog = inject(MatDialog);
  private translate = inject(TranslateService);
  private connectorPreviewService = inject(ConnectorPreviewService);

  readonly cohortId = input<number | undefined>(undefined);
  readonly config = model.required<ConnectorDTO>();
  readonly configChange = output<ConnectorDTO>();
  readonly save = output<ConnectorStepConfigChangeEmitter>();
  sheets: { name: string; info: UploadInfoView }[] = [];
  sourceTables: { name: string; info: UploadInfoView }[] = [];
  pivotTables: { name: string; info: UploadInfoView }[] = [];
  activeSheetIndex = 0;
  mergeConfig?: SheetMergeResultDTO;
  pivotPreviewRunning = signal(false);
  isToolBased = signal<boolean>(false);
  fileDetails = signal<ConnectorFilesDetailDTO | null>(null);

  ngOnInit(): void {
    const config = this.config();

    if (config) {
      if (config.inputConfig && config.inputConfig.mode === 'APP') {
        this.isToolBased.set(true);
      }
      if (config.mergeConfig) {
        this.mergeConfig = config.mergeConfig;
      }
      if (config.fileInfo && Object.keys(config.fileInfo).length > 0) {
        this.applyFileInfo(config.fileInfo, false);
      }

      const uploadInfoValues = Object.values(config?.uploadInfo ?? {});
      const hasNoData = uploadInfoValues.every(item => !item.data?.length);
      const wantsAllSheets = !!config.inputConfig && isFileUploadSettings(config.inputConfig) && config.inputConfig.firstSheetOnly === false;
      const cachedSheetCount = uploadInfoValues.length;
      const needsOriginalPivotColumns = !!config.pivotConfig
        && !!config.inputConfig
        && isFileUploadSettings(config.inputConfig);

      if (hasNoData || needsOriginalPivotColumns || (wantsAllSheets && cachedSheetCount <= 1)) {
        this.loadColumns();
      }
    }
  }

  get isCsvZip(): boolean {
    const input = this.config().inputConfig;
    if (!input || !isFileUploadSettings(input)) return false;
    return input.fileType === 'CSV' && !input.firstSheetOnly;
  }

  changeConfigAppBased(config: ConnectorDTO) {
    this.config.set(config);
    this.configChange.emit(this.config());
  }

  toolRunStarted(): void {
    this.sheets = [];
  }

  loadColumns() {
    const config = this.config();
    const cohortId = this.getCohortId();
    const inputConfig = config.inputConfig;
    if (inputConfig && cohortId && isAppBasedUploadSettings(inputConfig)) {
      this.loadStoredAppOutputs(cohortId, inputConfig);
      return;
    }

    if (inputConfig
      && cohortId
      && 'fileId' in inputConfig
      && inputConfig.fileId
      && (isFileUploadSettings(inputConfig))) {
      this.uploadService.getFileDetail(cohortId, inputConfig.fileId).pipe(
        catchError((error) => {
          console.error(this.translate.instant('ERROR.ERROR_WITH_LOADING_THE_COLUMNS'), error);
          this.snackBar.open(
            this.translate.instant('ERROR.ERROR_WITH_LOADING_THE_COLUMNS'),
            this.translate.instant('BUTTON.CLOSE'), {
              duration: 5000,
              verticalPosition: 'top',
            });
          this.cdr.detectChanges();
          throw error;
        })
      ).subscribe((info: ConnectorFilesDetailDTO) => {
        this.fileDetails.set(info);
        this.setFileInfo(info);
      });
    } else {
      this.snackBar.open(
        this.translate.instant('ERROR.CORRUPT_CONFIG'),
        this.translate.instant('BUTTON.CLOSE'), {
          duration: 5000,
          verticalPosition: 'top',
        });
    }
  }

  private loadStoredAppOutputs(cohortId: number, inputConfig: AppBasedUploadSettings): void {
    const outputs = Object.entries(inputConfig.outputParams ?? {})
      .filter(([, fileId]) => fileId !== null && fileId !== undefined);

    if (outputs.length === 0) {
      this.snackBar.open(
        this.translate.instant('WARNING.RUN_EXTRACTOR_BEFORE_PREVIEW'),
        this.translate.instant('BUTTON.CLOSE'), {
          duration: 5000,
          verticalPosition: 'top',
        });
      return;
    }

    forkJoin(outputs.map(([name, fileId]) =>
      this.uploadService.getFileDetail(cohortId, fileId).pipe(
        map(detail => ({name, detail})),
        catchError(() => of(null))
      )
    )).subscribe(results => {
      const fileInfo: Record<string, UploadInfoDTO> = {};
      let lastDetail: ConnectorFilesDetailDTO | null = null;

      results.filter(r => r !== null).forEach(({name, detail}) => {
        lastDetail = detail;
        const sheets = connectorFilesDetailToFileInfo(detail);
        const sheetNames = Object.keys(sheets);
        sheetNames.forEach(sheet => {
          const key = sheetNames.length <= 1 ? name : `${name}/${sheet}`;
          fileInfo[key] = {...sheets[sheet], sheet: key};
        });
      });

      if (Object.keys(fileInfo).length === 0) {
        this.snackBar.open(
          this.translate.instant('ERROR.ERROR_WITH_LOADING_THE_COLUMNS'),
          this.translate.instant('BUTTON.CLOSE'), {
            duration: 5000,
            verticalPosition: 'top',
          });
        return;
      }

      this.fileDetails.set(lastDetail);
      this.applyFileInfo(fileInfo);
      this.cdr.detectChanges();
    });
  }

  setAppBasedResult(uploadInfo: ConnectorFileUploadInfoDTO[]) {
    this.setFileInfo({uploadInfo} as ConnectorFilesDetailDTO)
  }

  setFileInfo(info: ConnectorFilesDetailDTO) {
    const fileInfo = connectorFilesDetailToFileInfo(info);
    this.applyFileInfo(fileInfo);
  }

  openRenameDialog(renamedColumn: string, columnName: string, index: number, sheetName: string): void {
    const sheet = this.sheets.find(s => s.name === sheetName);
    if (!sheet) {
      console.error('Sheet not found:', sheetName);
      return;
    }

    const deleted = sheet.info.deletedColumns[index];
    const dialogRef = this.dialog.open(
      ConnectorStepSpecifySelectorsChangeNameComponent,
      {
        data: {
          renamedColumn: renamedColumn,
          columnName: columnName,
          deleted: deleted
        }
      }
    );

    dialogRef.afterClosed().subscribe((result: UploadInfoDialog) => {
      if (!result) return;
      sheet.info.renamedColumns[index] = result.renamedColumn;
      sheet.info.deletedColumns[index] = result.deleted;
      this.updateConfigFileInfo();
      this.emitConfigChange();
      this.cdr.detectChanges();
    });
  }

  headerClick(event: { columnName: string, index: number }, sheetName: string): void {
    const sheet = this.sheets.find(s => s.name === sheetName);
    if (!sheet) {
      console.error('Sheet not found:', sheetName);
      return;
    }
    const name = sheet.info.columns[event.index];
    this.openRenameDialog(event.columnName, name, event.index, sheetName);
  }

  onContinueClick(): boolean {
    const fileInfo = this.config().fileInfo;
    if (!fileInfo || Object.keys(fileInfo).length === 0) {
      this.snackBar.open(
        this.translate.instant('WARNING.PLEASE_SELECT_COLUMN_FIRST'),
        this.translate.instant('BUTTON.CLOSE'), {
          duration: 5000,
          verticalPosition: 'top',
        });
      return false;
    }
    this.updateConfigFileInfo();
    this.emitConfigChange();
    return true;
  }

  openPivotDialog(): void {
    const dialogRef = this.dialog.open(PivotTableDialogComponent, {
      width: '90vw',
      maxWidth: '1400px',
      height: '80vh',
      data: {
        sheets: this.sourceTables,
        pivotConfig: this.config().pivotConfig,
      },
    });

    dialogRef.afterClosed().subscribe((result?: PivotTableDialogResult) => {
      if (!result?.applied) {
        return;
      }
      this.applyPivotConfig(result.pivotConfig);
    });
  }

  pivotedTableCount(): number {
    return Object.keys(this.config().pivotConfig?.valueColumnIndex ?? {}).length;
  }

  openMergeDialog(): void {
    const isMerged = this.sheets.length === 1
      && this.sheets[0].name === 'Merged' && this.mergeConfig;

    if (this.pivotTables.length > 1) {
      this.showMergeDialog();
      return;
    }

    if (this.fileDetails()) {
      this.showMergeDialog();

      return;
    }

    const config = this.config();
    const cohortId = this.getCohortId();
    if (isMerged
      && cohortId
      && config.inputConfig
      && 'fileId' in config.inputConfig
      && config.inputConfig.fileId
      && (isFileUploadSettings(config.inputConfig))) {
      // Re-fetch original sheets to show tabs and open dialog
      this.uploadService.getFileDetail(cohortId, config.inputConfig.fileId).pipe(
        catchError((error) => {
          console.error('Failed to reload sheets', error);
          this.snackBar.open(
            this.translate.instant('ERROR.ERROR_WITH_LOADING_THE_COLUMNS'),
            this.translate.instant('BUTTON.CLOSE'),
            {duration: 5000, verticalPosition: 'top'}
          );
          throw error;
        })
      ).subscribe((info: ConnectorFilesDetailDTO) => {
        this.fileDetails.set(info);
        this.sheets = this.mapFileInfoToSheets(connectorFilesDetailToFileInfo(info));
        this.cdr.detectChanges();
        this.showMergeDialog();
      });
    } else {
      this.showMergeDialog();
    }
  }

  private showMergeDialog(): void {
    const sheetData = this.pivotTables.map(sheet => ({
      name: sheet.name,
      columns: sheet.info.columns
    }));

    const dialogRef = this.dialog.open(MergeSheetsDialogComponent, {
      data: {
        sheets: sheetData,
        isCsvZip: this.isCsvZip,
      },
      width: '500px'
    });

    dialogRef.afterClosed().subscribe((result: SheetMergeResultDTO) => {
      if (!result) {
        // User canceled — re-merge with existing config if we unmerged
        if (this.mergeConfig && this.sheets.length > 1) {
          this.mergeSheets(this.mergeConfig, false);
        }
        return;
      }
      this.mergeConfig = result;
      this.config.update(configValue => ({...configValue, mergeConfig: result}));
      this.emitConfigChange();
      this.mergeSheets(result);
    });
  }

  private mergeSheets(_mergeConfig: SheetMergeResultDTO, showMessage: boolean = true): void {
    if (this.pivotTables.length < 2) return;

    // Build UploadInfoDTO map from current sheets
    const fileInfoMap = this.sheetsToFileInfo(this.pivotTables);

    const mergedFileInfo = mergeFileInfo(fileInfoMap, _mergeConfig);
    this.sheets = this.mapFileInfoToSheets(mergedFileInfo);
    this.updateConfigFileInfo();
    this.emitConfigChange();
    this.cdr.detectChanges();

    if (showMessage) {
      this.snackBar.open(
        this.translate.instant(
          this.isCsvZip ? 'SUCCESS.CSV_FILES_MERGED' : 'SUCCESS.SHEETS_MERGED'
        ),
        this.translate.instant('BUTTON.CLOSE'),
        {
          duration: 3000,
          verticalPosition: 'top',
        }
      );
    }
  }

  private updateConfigFileInfo(): void {
    const updatedFileInfo: Record<string, UploadInfoDTO> = {};
    this.sheets.forEach(sheet => {
      updatedFileInfo[sheet.name] = {
        json: JSON.stringify(sheet.info.json),
        data: sheet.info.json,
        columns: sheet.info.columns,
        renamedColumns: sheet.info.renamedColumns,
        deletedColumns: sheet.info.deletedColumns,
        lastUploaded: sheet.info.lastUploaded,
        fileExists: sheet.info.fileExists
      };
    });
    this.config.update(config => ({
      ...config,
      fileInfo: updatedFileInfo,
      uploadInfo: updatedFileInfo,
      mergeConfig: this.mergeConfig,
    }));
  }

  openFileInfoDialog(): void {
    const detail = this.fileDetails();
    if (!detail) {
      return;
    }

    this.dialog.open(ConnectorFileInfoDialogComponent, {
      width: '520px',
      data: detail
    }).afterClosed().subscribe(result => {
      if (result === 'reload') {
        this.loadColumns();
      }
    });
  }

  private mapFileInfoToSheets(fileInfo: Record<string, UploadInfoDTO>): { name: string; info: UploadInfoView }[] {
    return Object.entries(fileInfo)
      .map(([name, info]) => ({
        name,
        info: {
          json: info.data ?? this.parseSheetJson(info.json),
          columns: info.columns,
          renamedColumns: info.renamedColumns,
          deletedColumns: info.deletedColumns,
          lastUploaded: info.lastUploaded,
          fileExists: info.fileExists
        }
      }))
      .filter(sheet => this.isSheetValid(sheet.info));
  }

  private parseSheetJson(json: string | undefined): any[] {
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

  private isSheetValid(info: UploadInfoView): boolean {
    return !!(info.columns && info.columns.length > 0);
  }

  private applyFileInfo(
    fileInfo: Record<string, UploadInfoDTO>,
    emitChange = true,
  ): void {
    this.sourceTables = this.mapFileInfoToSheets(fileInfo);
    this.pivotTables = this.mapFileInfoToSheets(fileInfo);
    this.reconcileSingleTablePivotKey();

    const nextFileInfo = this.mergeConfig && this.pivotTables.length > 1
      ? mergeFileInfo(this.sheetsToFileInfo(this.pivotTables), this.mergeConfig)
      : fileInfo;

    this.sheets = this.mapFileInfoToSheets(nextFileInfo);
    this.updateConfigFileInfo();

    if (emitChange) {
      this.emitConfigChange();
    }

    this.cdr.detectChanges();

    if (emitChange && this.config().pivotConfig) {
      this.refreshPivotPreview();
    }
  }

  private emitConfigChange(): void {
    this.configChange.emit(this.config());
  }

  private getCohortId(): number | undefined {
    return this.config().cohortId ?? this.cohortId();
  }

  private applyPivotConfig(pivotConfig?: PivotConfigDTO): void {
    this.config.update(config => ({...config, pivotConfig}));
    this.emitConfigChange();

    if (!pivotConfig) {
      this.pivotTables = this.sourceTables;
      this.refreshMergeAfterPivotPreview();
      return;
    }

    this.refreshPivotPreview();
  }

  private refreshPivotPreview(): void {
    this.pivotPreviewRunning.set(true);
    this.connectorPreviewService.previewPivot(configToConnectorConfigDTO(this.config())).pipe(
      finalize(() => this.pivotPreviewRunning.set(false))
    ).subscribe({
      next: rowsByTable => this.applyPivotPreview(rowsByTable),
      error: () => {
        // The service displays backend validation and generic preview errors.
      }
    });
  }

  private applyPivotPreview(rowsByTable: any[][]): void {
    const responseContainsAllTables = rowsByTable.length === this.sourceTables.length;
    let enabledResponseIndex = 0;

    const previewSheets = this.sourceTables.map((table, tableIndex) => {
      let rows = table.info.json;
      if (responseContainsAllTables) {
        rows = rowsByTable[tableIndex] ?? [];
      } else if (this.config().pivotConfig?.valueColumnIndex[table.name] !== undefined) {
        rows = rowsByTable[enabledResponseIndex++] ?? [];
      }

      const columns = rows.length > 0 ? Object.keys(rows[0]) : [];
      return {
        name: table.name,
        info: {
          ...table.info,
          json: rows,
          columns,
          renamedColumns: [...columns],
          deletedColumns: new Array(columns.length).fill(false),
        }
      };
    });

    this.pivotTables = previewSheets;
    this.refreshMergeAfterPivotPreview();
  }

  private refreshMergeAfterPivotPreview(): void {
    if (this.mergeConfig && !this.isMergeConfigValid(this.mergeConfig)) {
      this.mergeConfig = undefined;
    }

    if (this.mergeConfig && this.pivotTables.length > 1) {
      const merged = mergeFileInfo(this.sheetsToFileInfo(this.pivotTables), this.mergeConfig);
      this.sheets = this.mapFileInfoToSheets(merged);
    } else {
      this.sheets = this.pivotTables;
    }

    this.updateConfigFileInfo();
    this.emitConfigChange();
    this.cdr.detectChanges();
  }

  private isMergeConfigValid(mergeConfig: SheetMergeResultDTO): boolean {
    return this.pivotTables.every(table => {
      const selectedColumn = mergeConfig.sheetUidMapping[table.name];
      return !!selectedColumn && table.info.columns.includes(selectedColumn);
    });
  }

  private sheetsToFileInfo(sheets: { name: string; info: UploadInfoView }[]): Record<string, UploadInfoDTO> {
    return Object.fromEntries(sheets.map(sheet => [
      sheet.name,
      {
        json: JSON.stringify(sheet.info.json),
        data: sheet.info.json.map(row => ({...row})),
        columns: [...sheet.info.columns],
        renamedColumns: [...sheet.info.renamedColumns],
        deletedColumns: [...sheet.info.deletedColumns],
        lastUploaded: sheet.info.lastUploaded,
        fileExists: sheet.info.fileExists,
      }
    ]));
  }

  private reconcileSingleTablePivotKey(): void {
    if (this.sourceTables.length !== 1 || this.sourceTables[0].name === 'Merged') {
      return;
    }

    const valueColumnIndex = this.config().pivotConfig?.valueColumnIndex;
    if (!valueColumnIndex) {
      return;
    }

    const entries = Object.entries(valueColumnIndex);
    const tableName = this.sourceTables[0].name;
    if (entries.length !== 1 || entries[0][0] === tableName) {
      return;
    }

    const [previousTableName, columnIndex] = entries[0];
    const pivotConfig = this.config().pivotConfig!;
    const mode = pivotConfig.mode?.[previousTableName];
    const prefix = pivotConfig.prefix?.[previousTableName];
    const valueFormat = pivotConfig.valueFormat?.[previousTableName];
    this.config.update(config => ({
      ...config,
      pivotConfig: {
        valueColumnIndex: {[tableName]: columnIndex},
        mode: mode ? {[tableName]: mode} : undefined,
        prefix: prefix !== undefined ? {[tableName]: prefix} : undefined,
        valueFormat: valueFormat ? {[tableName]: valueFormat} : undefined,
      }
    }));
  }
}
