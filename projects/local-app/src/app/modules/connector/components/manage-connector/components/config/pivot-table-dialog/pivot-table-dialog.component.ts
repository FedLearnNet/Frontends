import {Component, inject, OnInit} from '@angular/core';
import {
  CloseableDialogTitleComponent
} from "@shared-lib/components/closeable-dialog-title/closeable-dialog-title.component";
import {ConnectorDynamicTableComponent} from "../../table/dynamic-table/dynamic-table.component";
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogContent,
  MatDialogRef
} from "@angular/material/dialog";
import {UploadInfoView} from "../../../../../dto/upload-info";
import {MatTabsModule} from "@angular/material/tabs";
import {PivotConfigDTO, PivotMode, PivotValueFormat} from "../../../../../dto/connector";
import {MatFormField, MatLabel} from "@angular/material/form-field";
import {MatInput} from "@angular/material/input";
import {MatOption, MatSelect} from "@angular/material/select";
import {TranslatePipe, TranslateService} from "@ngx-translate/core";
import {BtnComponent} from "@shared-lib/components/btn/btn.component";
import {ErrorCardComponent} from "@shared-lib/components/error-card/error-card.component";

export interface PivotPreviewSheet {
  name: string;
  info: UploadInfoView;
}

export interface PivotTableDialogData {
  sheets: PivotPreviewSheet[];
  pivotConfig?: PivotConfigDTO;
}

export interface PivotTableDialogResult {
  applied: true;
  pivotConfig?: PivotConfigDTO;
}

@Component({
  selector: 'app-pivot-table-dialog',
  imports: [
    CloseableDialogTitleComponent,
    ConnectorDynamicTableComponent,
    MatTabsModule,
    MatFormField,
    MatLabel,
    MatInput,
    MatSelect,
    MatOption,
    MatDialogContent,
    MatDialogActions,
    TranslatePipe,
    BtnComponent,
    ErrorCardComponent
  ],
  templateUrl: './pivot-table-dialog.component.html',
  styleUrl: './pivot-table-dialog.component.scss',
})
export class PivotTableDialogComponent implements OnInit {
  private readonly dialogRef = inject<MatDialogRef<PivotTableDialogComponent>>(MatDialogRef);
  private readonly translate = inject(TranslateService);
  readonly data = inject<PivotTableDialogData>(MAT_DIALOG_DATA);

  valueColumnIndex: Record<string, number> = {};
  mode: Record<string, PivotMode> = {};
  prefix: Record<string, string> = {};
  valueFormat: Record<string, PivotValueFormat> = {};
  previewSheets: PivotPreviewSheet[] = [];
  previewError?: string;

  ngOnInit(): void {
    this.valueColumnIndex = {...(this.data.pivotConfig?.valueColumnIndex ?? {})};
    this.mode = {...(this.data.pivotConfig?.mode ?? {})};
    this.prefix = {...(this.data.pivotConfig?.prefix ?? {})};
    this.valueFormat = {...(this.data.pivotConfig?.valueFormat ?? {})};
    this.previewSheets = this.data.sheets;
    if (this.isValid()) {
      this.previewPivot();
    }
  }

  getPivotColumnIndex(tableName: string): number | undefined {
    return this.valueColumnIndex[tableName];
  }

  getPivotMode(tableName: string): PivotMode {
    return this.mode[tableName] ?? PivotMode.TRANSPOSE;
  }

  getPrefix(tableName: string): string {
    return this.prefix[tableName] ?? '';
  }

  getValueFormat(tableName: string): PivotValueFormat {
    return this.valueFormat[tableName] ?? PivotValueFormat.TRUE_FALSE;
  }

  selectPivotColumn(tableName: string, columnIndex: number): void {
    this.valueColumnIndex[tableName] = columnIndex;
    this.previewPivot();
  }

  selectPivotMode(tableName: string, mode: PivotMode): void {
    this.mode[tableName] = mode;
    if (mode === PivotMode.TRANSPOSE) {
      delete this.prefix[tableName];
      delete this.valueFormat[tableName];
    }
    this.previewPivot();
  }

  selectPrefix(tableName: string, prefix: string): void {
    this.prefix[tableName] = prefix;
    this.previewPivot();
  }

  selectValueFormat(tableName: string, valueFormat: PivotValueFormat): void {
    this.valueFormat[tableName] = valueFormat;
    this.previewPivot();
  }

  isValid(): boolean {
    return this.data.sheets.length > 0 && this.data.sheets.every(table => {
      const tableName = table.name;
      const columnIndex = this.valueColumnIndex[tableName];
      const isValueColumnValid = Number.isInteger(columnIndex)
        && columnIndex >= 0
        && columnIndex < table.info.columns.length;
      return isValueColumnValid;
    });
  }

  previewPivot(): void {
    if (!this.isValid()) {
      this.previewError = this.translate.instant('WARNING.PIVOT_VALUE_COLUMN_REQUIRED');
      return;
    }

    try {
      this.previewSheets = this.data.sheets.map(sheet => this.pivotSheet(sheet));
      this.previewError = undefined;
    } catch (error) {
      this.previewError = error instanceof Error ? error.message : String(error);
    }
  }

  apply(): void {
    if (!this.isValid()) {
      this.previewError = this.translate.instant('WARNING.PIVOT_VALUE_COLUMN_REQUIRED');
      return;
    }

    const valueColumnIndex = Object.fromEntries(
      this.data.sheets.map(table => [table.name, this.valueColumnIndex[table.name]])
    );
    const mode = Object.fromEntries(
      this.data.sheets.map(table => table.name)
        .filter(tableName => this.getPivotMode(tableName) !== PivotMode.TRANSPOSE)
        .map(tableName => [tableName, this.getPivotMode(tableName)])
    );
    const oneHotTables = this.data.sheets.map(table => table.name)
      .filter(tableName => this.getPivotMode(tableName) === PivotMode.ONE_HOT);
    const prefix = Object.fromEntries(
      oneHotTables.map(tableName => [tableName, this.getPrefix(tableName)])
    );
    const valueFormat = Object.fromEntries(
      oneHotTables.map(tableName => [tableName, this.getValueFormat(tableName)])
    );
    this.dialogRef.close({
      applied: true,
      pivotConfig: Object.keys(valueColumnIndex).length > 0
        ? {
          valueColumnIndex,
          mode: Object.keys(mode).length > 0 ? mode : undefined,
          prefix: Object.keys(prefix).length > 0 ? prefix : undefined,
          valueFormat: Object.keys(valueFormat).length > 0 ? valueFormat : undefined,
        }
        : undefined,
    } satisfies PivotTableDialogResult);
  }

  doNotPivot(): void {
    this.dialogRef.close({
      applied: true,
      pivotConfig: undefined,
    } satisfies PivotTableDialogResult);
  }

  toggleMaximize(isMaximized: boolean): void {
    if (isMaximized) {
      this.dialogRef.updateSize('100vw', '100vh');
    } else {
      this.dialogRef.updateSize('90vw', '80vh');
    }
  }

  private pivotSheet(sheet: PivotPreviewSheet): PivotPreviewSheet {
    return this.getPivotMode(sheet.name) === PivotMode.ONE_HOT
      ? this.pivotSheetOneHot(sheet)
      : this.pivotSheetTranspose(sheet);
  }

  private pivotSheetTranspose(sheet: PivotPreviewSheet): PivotPreviewSheet {
    const valueColumnIndex = this.valueColumnIndex[sheet.name];
    const sourceColumns = sheet.info.columns;
    const valueColumn = sourceColumns[valueColumnIndex];
    const pivotedColumns = [valueColumn];
    const knownColumns = new Set(pivotedColumns);

    sheet.info.json.forEach((sourceRow, rowIndex) => {
      const columnName = sourceRow?.[valueColumn] == null
        ? ''
        : String(sourceRow[valueColumn]).trim();
      if (!columnName) {
        throw new Error(`Pivot value column '${valueColumn}' is blank in source row ${rowIndex + 1}`);
      }
      if (knownColumns.has(columnName)) {
        throw new Error(`Pivot value column '${valueColumn}' produces duplicate output column '${columnName}'`);
      }
      knownColumns.add(columnName);
      pivotedColumns.push(columnName);
    });

    const rows = sourceColumns
      .filter((_, columnIndex) => columnIndex !== valueColumnIndex)
      .map(sourceColumn => {
        const outputRow: Record<string, unknown> = {[valueColumn]: sourceColumn};
        sheet.info.json.forEach((sourceRow, rowIndex) => {
          outputRow[pivotedColumns[rowIndex + 1]] = sourceRow?.[sourceColumn] ?? null;
        });
        return outputRow;
      });

    return {
      name: sheet.name,
      info: {
        ...sheet.info,
        json: rows,
        columns: pivotedColumns,
        renamedColumns: [...pivotedColumns],
        deletedColumns: new Array(pivotedColumns.length).fill(false),
      }
    };
  }

  private pivotSheetOneHot(sheet: PivotPreviewSheet): PivotPreviewSheet {
    const valueColumnIndex = this.valueColumnIndex[sheet.name];
    const valueColumn = sheet.info.columns[valueColumnIndex];
    const retainedColumns = sheet.info.columns.filter((_, columnIndex) => columnIndex !== valueColumnIndex);
    const prefix = this.getPrefix(sheet.name);
    const generatedColumns: string[] = [];
    const knownColumns = new Set(retainedColumns);

    sheet.info.json.forEach((sourceRow, rowIndex) => {
      const generatedColumn = this.getOneHotGeneratedColumn(sourceRow, valueColumn, prefix, rowIndex);
      if (retainedColumns.includes(generatedColumn)) {
        throw new Error(`Pivot value '${generatedColumn}' conflicts with a retained source column`);
      }
      if (!knownColumns.has(generatedColumn)) {
        knownColumns.add(generatedColumn);
        generatedColumns.push(generatedColumn);
      }

    });

    const columns = [...retainedColumns, ...generatedColumns];
    const rows = sheet.info.json.map((sourceRow, rowIndex) => {
      const outputRow: Record<string, unknown> = {};
      retainedColumns.forEach(column => outputRow[column] = sourceRow?.[column] ?? null);
      const activeColumn = this.getOneHotGeneratedColumn(sourceRow, valueColumn, prefix, rowIndex);
      generatedColumns.forEach(column => outputRow[column] = this.formatPivotValue(
        activeColumn === column,
        this.getValueFormat(sheet.name)
      ));
      return outputRow;
    });

    return {
      name: sheet.name,
      info: {
        ...sheet.info,
        json: rows,
        columns,
        renamedColumns: [...columns],
        deletedColumns: new Array(columns.length).fill(false),
      }
    };
  }

  private getOneHotGeneratedColumn(
    sourceRow: Record<string, unknown> | null | undefined,
    valueColumn: string,
    prefix: string,
    rowIndex: number
  ): string {
    const rawColumnName = sourceRow?.[valueColumn] == null
      ? ''
      : String(sourceRow[valueColumn]).trim();
    if (!rawColumnName) {
      throw new Error(`Pivot value column '${valueColumn}' is blank in source row ${rowIndex + 1}`);
    }
    return `${prefix}${rawColumnName}`;
  }

  private formatPivotValue(value: boolean, format: PivotValueFormat): boolean | string | number {
    switch (format) {
      case PivotValueFormat.YES_NO:
        return value ? 'yes' : 'no';
      case PivotValueFormat.ONE_ZERO:
        return value ? 1 : 0;
      default:
        return value;
    }
  }

  protected readonly PivotMode = PivotMode;
  protected readonly PivotValueFormat = PivotValueFormat;
}
