import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  model,
  OnInit,
  signal,
  ViewChild
} from '@angular/core';
import {MatToolbar} from "@angular/material/toolbar";
import {MatIconButton} from "@angular/material/button";
import {MatIcon} from "@angular/material/icon";
import {MatProgressSpinner} from "@angular/material/progress-spinner";
import Papa from 'papaparse';
import {CdkVirtualScrollViewport, ScrollingModule} from "@angular/cdk/scrolling";
import {CsvFileSchemaCardComponent} from "@shared-lib/components/csv-file-schema-card/csv-file-schema-card.component";
import {MatSidenavModule} from "@angular/material/sidenav";
import {ExpandCellDirective} from "@shared-lib/directives/expand-cell.directive";
import {CsvFileStatisticsComponent} from "@shared-lib/components/csv-file-statistics/csv-file-statistics.component";
import {CsvFileStatisticsField} from "@shared-lib/models/data-statistics";
import {DataStatistics} from "@shared-lib/services/data-statistics";
import {CsvFileDiagramComponent} from "@shared-lib/components/csv-file-diagram/csv-file-diagram.component";
import {MatTabsModule} from "@angular/material/tabs";

//inspired by https://www.tablab.app/

@Component({
  selector: 'lib-csv-file-viewer',
  imports: [
    MatToolbar,
    MatIcon,
    MatIconButton,
    MatProgressSpinner,
    ScrollingModule,
    MatSidenavModule,
    CsvFileSchemaCardComponent,
    ExpandCellDirective,
    CsvFileStatisticsComponent,
    CsvFileDiagramComponent,
    MatTabsModule
  ],
  templateUrl: './csv-file-viewer.component.html',
  styleUrl: './csv-file-viewer.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CsvFileViewerComponent implements OnInit {
  private readonly dataStatistics: DataStatistics = inject(DataStatistics);

  readonly rowHeight = 45;
  readonly maxViewportHeight = 500;
  readonly extraHeaderHeight = this.rowHeight;

  data = input.required<string>();
  isBase64Encoded = input<boolean>(true);
  isTSV = input<boolean>(false);
  showToolbar = input<boolean>(false);

  loading = signal(false);
  columns = signal<string[]>([]);
  rows = signal<Array<Record<string, any>>>([]);
  error = model<string | null>(null);

  showStatistics = signal(false);
  statistics = computed<Map<string, CsvFileStatisticsField>>(() => {
    if (!this.rows().length) return new Map();
    const rows = this.rows();
    const cols = this.columns();
    return new Map(cols.map(col => [col, this.dataStatistics.getArrayStatistics(rows, col)]));
  });

  viewportHeight = computed(() => {
    const rowCount = this.rows().length;
    const bodyHeight = rowCount * this.rowHeight;
    const total = bodyHeight + this.extraHeaderHeight;
    return Math.min(total, this.maxViewportHeight);
  });

  @ViewChild(CdkVirtualScrollViewport, {static: false})
  public viewPort: CdkVirtualScrollViewport;


  ngOnInit(): void {
    this.loadFromBase64OrUrl();
  }

  private loadFromBase64OrUrl(): void {
    if (this.data() && this.data()!.trim().length > 0) {
      let rawText = this.data()!;
      if (this.isBase64Encoded()) {
        const parsed = this.parseBase64(this.data()!.trim());
        if (!parsed) {
          return;
        }
        rawText = parsed;
      }
      this.parseData(rawText);
      return;
    }

    this.error.set('Data is empty .');
  }

  private parseBase64(base64: string): string | null {
    this.loading.set(true);
    this.error.set(null);

    const base64TSV = /^data:text\/(csv);base64,/;
    if (base64TSV.test(base64)) {
      base64 = base64.replace(base64TSV, "");
    }

    const base64CSV = /^data:text\/(tab-separated-values);base64,/;
    if (base64CSV.test(base64)) {
      base64 = base64.replace(base64CSV, "");
    }

    try {
      return atob(base64);
    } catch (_e) {
      this.loading.set(false);
      this.error.set('Invalid Base64 string.');
      return null;
    }
  }

  private parseData(rawText: string): void {
    this.loading.set(true);
    this.error.set(null);
    const settings = this.isTSV() ? {
      delimiter: '\t',
      header: true,
      skipEmptyLines: true
    } : {delimiter: ',', header: true, skipEmptyLines: true};
    //const settings = this.detectDelimiterAndHeader(rawText);
    const parsed = Papa.parse<{ [k: string]: any }>(rawText, settings);

    if (parsed.errors.length > 0) {
      const msg = parsed.errors.map((e) => e.message).join('; ');
      this.error.set(`Parse error: ${msg}`);
      this.loading.set(false);
      return;
    }

    const rowsArray = parsed.data as Array<Record<string, any>>;
    const columnsArray = (parsed.meta.fields || []).filter(field => field !== '');

    this.columns.set(columnsArray);
    this.rows.set(rowsArray);
    this.loading.set(false);
  }

  private detectDelimiterAndHeader(rawText: string): {
    delimiter: ',' | ';' | '\t';
    hasHeader: boolean;
  } {
    const lines = rawText
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    if (lines.length === 0) {
      return {delimiter: ',', hasHeader: false};
    }

    const firstLine = lines[0];
    const secondLine = lines.length > 1 ? lines[1] : '';

    const commaCountFirst = (firstLine.match(/,/g) || []).length;
    const semicolonCountFirst = (firstLine.match(/;/g) || []).length;
    const tabCountFirst = (firstLine.match(/\t/g) || []).length;

    let delimiter: ',' | ';' | '\t' = ',';
    if (semicolonCountFirst > commaCountFirst && semicolonCountFirst > tabCountFirst) {
      delimiter = ';';
    } else if (tabCountFirst > commaCountFirst && tabCountFirst > semicolonCountFirst) {
      delimiter = '\t';
    }

    const firstFields = firstLine.split(delimiter);
    const secondFields = secondLine ? secondLine.split(delimiter) : [];

    const isNumeric = (s: string) => {
      if (s.trim() === '') return false;
      return !isNaN(parseFloat(s.replace(/,/g, '.')));
    };

    const numericCountFirst = firstFields.filter(isNumeric).length;
    const numericCountSecond = secondFields.filter(isNumeric).length;

    if (!secondLine) {
      return {
        delimiter,
        hasHeader: firstFields.some(f => !isNumeric(f))
      };
    }

    return {
      delimiter,
      hasHeader: numericCountFirst === 0 && numericCountSecond > 0 || numericCountFirst < numericCountSecond
    };
  }

  retry(): void {
    this.columns.set([]);
    this.rows.set([]);
    this.error.set(null);
    this.loading.set(false);
    this.loadFromBase64OrUrl();
  }

  public get inverseOfTranslation(): string {
    if (!this.viewPort || !this.viewPort["_renderedContentOffset"]) {
      return "-0px";
    }
    const offset = this.viewPort["_renderedContentOffset"];
    return `-${offset}px`;
  }

  public toggleStatistics() {
    this.showStatistics.update(value => !value)
  }
}
