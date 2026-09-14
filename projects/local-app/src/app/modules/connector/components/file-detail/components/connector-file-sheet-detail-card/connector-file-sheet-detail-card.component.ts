import {DecimalPipe} from '@angular/common';
import {Component, computed, input} from '@angular/core';
import {MatIcon} from '@angular/material/icon';
import {BadgeComponent} from '@shared-lib/components/badge/badge.component';
import {
  FileProfileCardComponent
} from '@shared-lib/modules/files/components/file-profile-card/file-profile-card.component';
import {ColumnProfile, FileProfile} from '@shared-lib/modules/files/dto/file';

export interface ConnectorFileSheetView {
  name: string;
  rows: Record<string, unknown>[];
  columns: string[];
  columnProfiles: ColumnProfile[];
  rowsScanned: number;
  /** Empty cells across the whole sheet, the same figure the import reported while reading it. */
  missingValues: number;
}

@Component({
  selector: 'app-connector-file-sheet-detail-card',
  templateUrl: './connector-file-sheet-detail-card.component.html',
  styleUrl: './connector-file-sheet-detail-card.component.scss',
  imports: [
    DecimalPipe,
    MatIcon,
    BadgeComponent,
    FileProfileCardComponent
  ]
})
export class ConnectorFileSheetDetailCardComponent {
  readonly fileName = input.required<string>();
  readonly sheet = input.required<ConnectorFileSheetView>();

  readonly profile = computed<FileProfile>(() => ({
    fileName: `${this.fileName()} - ${this.sheet().name}`,
    rowsScanned: this.sheet().rowsScanned,
    columns: this.sheet().columnProfiles,
    sampleRows: this.buildSampleRows(this.sheet().rows, this.sheet().columns)
  }));

  readonly pathLabel = computed(() => `Sheet: ${this.sheet().name}`);
  readonly hasStatistics = computed(() => this.sheet().columnProfiles.length > 0);

  private buildSampleRows(rows: Record<string, unknown>[], columns: string[]): string[] {
    return rows.slice(0, 10).map(row => columns.map(column => this.formatValue(row[column])).join(', '));
  }

  private formatValue(value: unknown): string {
    if (value === null || value === undefined) {
      return '';
    }

    if (Array.isArray(value) || typeof value === 'object') {
      return JSON.stringify(value);
    }

    return String(value);
  }
}
