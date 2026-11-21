import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  computed,
  inject,
  input,
  linkedSignal,
  OnInit,
  output,
  signal
} from '@angular/core';
import {ConnectorStepConfig, ConnectorStepConfigChangeEmitter} from "../../../../../models/connector-step-config";
import {
  appOutputsToFileInfo,
  connectorFilesDetailToFileInfo,
  filterSelectedOutputs,
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
import {ConnectorPreviewService, PreviewTable} from "../../../../../services/connector-preview.service";
import {configToConnectorConfigDTO} from "../../../../../models/connector-config";
import {PivotTableDialogComponent, PivotTableDialogResult} from "../pivot-table-dialog/pivot-table-dialog.component";
import {BtnComponent} from "@shared-lib/components/btn/btn.component";
import {InfoCardComponent} from "@shared-lib/components/info-card/info-card.component";
import {MatFormField, MatHint, MatLabel} from "@angular/material/form-field";
import {MatOption, MatSelect} from "@angular/material/select";

@Component({
  selector: 'app-specify-selectors',
  templateUrl: './specify-selectors.component.html',
  styleUrl: './specify-selectors.component.scss',
  changeDetection: ChangeDetectionStrategy.Eager,
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
    InfoCardComponent,
    MatFormField,
    MatLabel,
    MatHint,
    MatSelect,
    MatOption
  ]
})
export class ConnectorStepSpecifySelectorsComponent implements ConnectorStepConfig<ConnectorDTO>, OnInit {
  private uploadService = inject(ConnectorUploadService);
  private snackBar = inject(MatSnackBar);
  dialog = inject(MatDialog);
  private translate = inject(TranslateService);
  private connectorPreviewService = inject(ConnectorPreviewService);
  private cdr = inject(ChangeDetectorRef);

  readonly cohortId = input<number | undefined>(undefined);
  // eslint-disable-next-line @angular-eslint/no-input-rename -- public name belongs to the linkedSignal below
  readonly configInput = input.required<ConnectorDTO>({alias: 'config'});
  readonly config = linkedSignal(this.configInput);
  readonly configChange = output<ConnectorDTO>();
  readonly save = output<ConnectorStepConfigChangeEmitter>();
  /** Preview tables — signals so SSE/async updates paint under Eager/zoneless CD without a click. */
  readonly sheets = signal<{ name: string; info: UploadInfoView }[]>([]);
  readonly sourceTables = signal<{ name: string; info: UploadInfoView }[]>([]);
  readonly pivotTables = signal<{ name: string; info: UploadInfoView }[]>([]);
  activeSheetIndex = 0;
  readonly mergeConfig = signal<SheetMergeResultDTO | undefined>(undefined);
  pivotPreviewRunning = signal(false);
  isToolBased = signal<boolean>(false);
  fileDetails = signal<ConnectorFilesDetailDTO | null>(null);

  /** The outputs the extractor stored on its last run. */
  readonly outputNames = computed(() => {
    const inputConfig = this.config().inputConfig;
    return inputConfig && isAppBasedUploadSettings(inputConfig) ? Object.keys(inputConfig.outputParams ?? {}) : [];
  });

  /** The outputs the connector imports; several of them are merged. */
  readonly selectedOutputs = computed(() => {
    const inputConfig = this.config().inputConfig;
    return inputConfig && isAppBasedUploadSettings(inputConfig) ? inputConfig.selectedOutputs ?? [] : [];
  });

  ngOnInit(): void {
    const config = this.config();

    if (config) {
      if (config.inputConfig && config.inputConfig.mode === 'APP') {
        this.isToolBased.set(true);
      }
      if (config.mergeConfig) {
        this.mergeConfig.set(config.mergeConfig);
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

      // An app connector arrives with the tables of its stored outputs already loaded; loading them
      // again would drop the column edits it was saved with.
      const hasAppOutputs = this.isToolBased() && !!config.fileInfo && Object.keys(config.fileInfo).length > 0;

      if (!hasAppOutputs && (hasNoData || needsOriginalPivotColumns || (wantsAllSheets && cachedSheetCount <= 1))) {
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
    this.sheets.set([]);
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
      const loaded = results.flatMap(result => result ? [result] : []);
      const fileInfo = appOutputsToFileInfo(loaded);
      const lastDetail = loaded.length > 0 ? loaded[loaded.length - 1].detail : null;

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
    });
  }

  setAppBasedResult(uploadInfo: ConnectorFileUploadInfoDTO[]) {
    if (!uploadInfo?.length) {
      return;
    }
    const outputNames = this.outputNames();
    const normalized = uploadInfo.length === 1 && outputNames.length === 1
      ? [{...uploadInfo[0], sheet: outputNames[0]}]
      : uploadInfo.map((sheet, index) =>
        sheet.sheet && sheet.sheet !== String(index)
          ? sheet
          : {...sheet, sheet: outputNames[index] ?? sheet.sheet ?? String(index)});
    this.setFileInfo({uploadInfo: normalized} as ConnectorFilesDetailDTO);
  }

  setFileInfo(info: ConnectorFilesDetailDTO) {
    const fileInfo = connectorFilesDetailToFileInfo(info);
    this.applyFileInfo(fileInfo);
  }

  openRenameDialog(renamedColumn: string, columnName: string, index: number, sheetName: string): void {
    const sheet = this.sheets().find(s => s.name === sheetName);
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
      this.sheets.update(all => all.map(s => {
        if (s.name !== sheetName) {
          return s;
        }
        const renamedColumns = [...s.info.renamedColumns];
        const deletedColumns = [...s.info.deletedColumns];
        renamedColumns[index] = result.renamedColumn;
        deletedColumns[index] = result.deleted;
        return {...s, info: {...s.info, renamedColumns, deletedColumns}};
      }));
      this.updateConfigFileInfo();
      this.emitConfigChange();
    });
  }

  headerClick(event: { columnName: string, index: number }, sheetName: string): void {
    const sheet = this.sheets().find(s => s.name === sheetName);
    if (!sheet) {
      console.error('Sheet not found:', sheetName);
      return;
    }
    const name = sheet.info.columns[event.index];
    this.openRenameDialog(event.columnName, name, event.index, sheetName);
  }

  selectOutputs(outputNames: string[]): void {
    this.mergeConfig.set(undefined);
    this.config.update(config => ({
      ...config,
      mergeConfig: undefined,
      inputConfig: {...config.inputConfig, selectedOutputs: outputNames} as AppBasedUploadSettings,
    }));
    this.activeSheetIndex = 0;
    this.loadColumns();
  }

  protected outputSelectionWarning(): string | undefined {
    if (!this.isToolBased() || this.outputNames().length < 2) {
      return undefined;
    }
    if (this.selectedOutputs().length === 0) {
      return 'WARNING.SELECT_APP_OUTPUT';
    }
    return this.selectedOutputs().length > 1 && !this.mergeConfig() ? 'WARNING.MERGE_APP_OUTPUTS' : undefined;
  }

  onContinueClick(): boolean {
    const outputWarning = this.outputSelectionWarning();
    if (outputWarning) {
      this.snackBar.open(
        this.translate.instant(outputWarning),
        this.translate.instant('BUTTON.CLOSE'), {
          duration: 5000,
          verticalPosition: 'top',
        });
      return false;
    }
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
        sheets: this.sourceTables(),
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
    const sheets = this.sheets();
    const isMerged = sheets.length === 1
      && sheets[0].name === 'Merged' && !!this.mergeConfig();

    if (this.pivotTables().length > 1) {
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
        this.sheets.set(this.mapFileInfoToSheets(connectorFilesDetailToFileInfo(info)));
        this.showMergeDialog();
      });
    } else {
      this.showMergeDialog();
    }
  }

  private showMergeDialog(): void {
    const sheetData = this.pivotTables().map(sheet => ({
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
        const mergeConfig = this.mergeConfig();
        if (mergeConfig && this.sheets().length > 1) {
          this.mergeSheets(mergeConfig, false);
        }
        return;
      }
      this.mergeConfig.set(result);
      this.config.update(configValue => ({...configValue, mergeConfig: result}));
      this.emitConfigChange();
      this.mergeSheets(result);
    });
  }

  private mergeSheets(_mergeConfig: SheetMergeResultDTO, showMessage: boolean = true): void {
    if (this.pivotTables().length < 2) return;

    // Build UploadInfoDTO map from current sheets
    const fileInfoMap = this.sheetsToFileInfo(this.pivotTables());

    const mergedFileInfo = mergeFileInfo(fileInfoMap, _mergeConfig);
    this.sheets.set(this.mapFileInfoToSheets(mergedFileInfo));
    this.updateConfigFileInfo();
    this.emitConfigChange();
    this.refreshMergedPreview();

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
    this.sheets().forEach(sheet => {
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
      mergeConfig: this.mergeConfig(),
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
    if (this.isToolBased()) {
      fileInfo = filterSelectedOutputs(fileInfo, this.selectedOutputs());
    }
    const mapped = this.mapFileInfoToSheets(fileInfo);
    this.sourceTables.set(mapped);
    this.pivotTables.set(mapped);
    this.reconcileSingleTablePivotKey();

    const mergeConfig = this.mergeConfig();
    const pivotTables = this.pivotTables();
    const nextFileInfo = mergeConfig && pivotTables.length > 1
      ? mergeFileInfo(this.sheetsToFileInfo(pivotTables), mergeConfig)
      : fileInfo;

    this.sheets.set(this.mapFileInfoToSheets(nextFileInfo));
    this.updateConfigFileInfo();
    this.cdr.detectChanges();

    if (emitChange) {
      this.emitConfigChange();
    }

    if (emitChange && this.config().pivotConfig) {
      this.refreshPivotPreview();
    } else {
      this.refreshMergedPreview();
    }
  }

  private refreshMergedPreview(): void {
    if (!this.mergeConfig() || this.config().pivotConfig || this.sheets().length !== 1) {
      return;
    }
    const config = {...this.config(), fileInfo: undefined, uploadInfo: undefined};
    this.connectorPreviewService.previewPivot(configToConnectorConfigDTO(config)).subscribe({
      next: ([table]) => {
        if (!table?.rows.length || this.sheets().length !== 1) {
          return;
        }
        const {rows, columns} = table;
        this.sheets.update(all => {
          const previous = all[0].info;
          const indexOf = (column: string) => previous.columns.indexOf(column);
          return [{
            ...all[0],
            info: {
              ...previous,
              json: rows,
              columns,
              renamedColumns: columns.map(c => indexOf(c) >= 0 ? previous.renamedColumns[indexOf(c)] : c),
              deletedColumns: columns.map(c => indexOf(c) >= 0 ? previous.deletedColumns[indexOf(c)] : false),
            }
          }];
        });
        this.updateConfigFileInfo();
        this.emitConfigChange();
      },
      error: () => {
        // The service already reports preview errors.
      }
    });
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
      this.pivotTables.set(this.sourceTables());
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
      next: tables => this.applyPivotPreview(tables),
      error: () => {
        // The service displays backend validation and generic preview errors.
      }
    });
  }

  private applyPivotPreview(tables: PreviewTable[]): void {
    const sourceTables = this.sourceTables();
    const responseContainsAllTables = tables.length === sourceTables.length;
    let enabledResponseIndex = 0;

    this.pivotTables.set(sourceTables.map((table, tableIndex) => {
      let preview: PreviewTable = {
        rows: table.info.json,
        columns: table.info.json.length > 0 ? table.info.columns : []
      };
      if (responseContainsAllTables) {
        preview = tables[tableIndex] ?? {rows: [], columns: []};
      } else if (this.config().pivotConfig?.valueColumnIndex[table.name] !== undefined) {
        preview = tables[enabledResponseIndex++] ?? {rows: [], columns: []};
      }

      const {rows, columns} = preview;
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
    }));
    this.refreshMergeAfterPivotPreview();
  }

  private refreshMergeAfterPivotPreview(): void {
    const mergeConfig = this.mergeConfig();
    if (mergeConfig && !this.isMergeConfigValid(mergeConfig)) {
      this.mergeConfig.set(undefined);
    }

    const activeMerge = this.mergeConfig();
    const pivotTables = this.pivotTables();
    if (activeMerge && pivotTables.length > 1) {
      const merged = mergeFileInfo(this.sheetsToFileInfo(pivotTables), activeMerge);
      this.sheets.set(this.mapFileInfoToSheets(merged));
    } else {
      this.sheets.set(pivotTables);
    }

    this.updateConfigFileInfo();
    this.emitConfigChange();
  }

  private isMergeConfigValid(mergeConfig: SheetMergeResultDTO): boolean {
    return this.pivotTables().every(table => {
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
    const sourceTables = this.sourceTables();
    if (sourceTables.length !== 1 || sourceTables[0].name === 'Merged') {
      return;
    }

    const valueColumnIndex = this.config().pivotConfig?.valueColumnIndex;
    if (!valueColumnIndex) {
      return;
    }

    const entries = Object.entries(valueColumnIndex);
    const tableName = sourceTables[0].name;
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
