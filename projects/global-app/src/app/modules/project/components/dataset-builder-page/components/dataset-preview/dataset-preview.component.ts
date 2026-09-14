import {CommonModule} from '@angular/common';
import {Component, computed, input, output} from '@angular/core';
import {MatCardModule} from "@angular/material/card";
import {MatProgressBarModule} from "@angular/material/progress-bar";
import {
  DatasetPreviewColumn,
  DatasetPreviewRow
} from "@global-app/project/components/dataset-builder-page/dataset-builder.models";
import {BadgeComponent} from "@shared-lib/components/badge/badge.component";
import {BtnComponent} from "@shared-lib/components/btn/btn.component";
import {PageWrapperComponent} from "@shared-lib/components/page-wrapper/page-wrapper.component";
import {CsvFileViewerComponent} from "@shared-lib/components/csv-file-viewer/csv-file-viewer.component";
import {EmptyStateComponent} from "@shared-lib/modules/app-execution/components/empty-state/empty-state.component";

@Component({
  selector: 'app-dataset-preview',
  imports: [
    CommonModule,
    MatCardModule,
    MatProgressBarModule,
    BadgeComponent,
    BtnComponent,
    PageWrapperComponent,
    CsvFileViewerComponent,
    EmptyStateComponent
  ],
  templateUrl: './dataset-preview.component.html',
  styleUrl: './dataset-preview.component.scss',
})
export class DatasetPreviewComponent {
  columns = input.required<DatasetPreviewColumn[]>();
  rows = input.required<DatasetPreviewRow[]>();
  loading = input<boolean>(false);
  error = input<string | null>(null);
  hasFeatureConfig = input<boolean>(false);
  previewDirty = input<boolean>(true);

  refreshRequested = output<void>();
  downloadRequested = output<void>();

  readonly hasRows = computed(() => this.columns().length > 0 && this.rows().length > 0);
  readonly previewCsv = computed(() => {
    const columns = this.columns();
    const rows = this.rows();
    if (!columns.length || !rows.length) {
      return '';
    }

    const header = columns.map(column => this.escapeCsv(column.label)).join(',');
    const body = rows.map(row =>
      columns
        .map(column => this.escapeCsv(row[column.id]))
        .join(',')
    );

    return [header, ...body].join('\n');
  });

  private escapeCsv(value: string | number | boolean | null | undefined): string {
    if (value == null) {
      return '';
    }

    const stringValue = String(value);
    if (/[",\n\r]/.test(stringValue)) {
      return `"${stringValue.replace(/"/g, '""')}"`;
    }

    return stringValue;
  }
}
