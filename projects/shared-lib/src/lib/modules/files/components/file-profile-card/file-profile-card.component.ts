import {ChangeDetectionStrategy, Component, computed, effect, input, signal} from '@angular/core';
import {ColumnProfile, FileProfile} from "@shared-lib/modules/files/dto/file";

import {MatCardModule} from '@angular/material/card';
import {MatIconModule} from '@angular/material/icon';
import {MatDividerModule} from '@angular/material/divider';
import {MatChipsModule} from '@angular/material/chips';
import {BadgeComponent} from "@shared-lib/components/badge/badge.component";
import {CsvFileViewerComponent} from "@shared-lib/components/csv-file-viewer/csv-file-viewer.component";
import {MatIconButton} from "@angular/material/button";

@Component({
  selector: 'lib-file-profile-card',
  imports: [MatCardModule, MatIconModule, MatDividerModule, MatChipsModule, BadgeComponent, CsvFileViewerComponent, MatIconButton],
  templateUrl: './file-profile-card.component.html',
  styleUrl: './file-profile-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FileProfileCardComponent {
  profile = input.required<FileProfile>();
  path = input<string | undefined>(undefined);
  initialExpanded = input(false);


  fileDetailParserError = signal<string | null>(null);
  expand = signal<boolean>(false);

  readonly colCount = computed(() => this.profile().columns?.length ?? 0);
  readonly missingTotal = computed(() =>
    (this.profile().columns ?? []).reduce((acc, c) => acc + (c.missing ?? 0), 0)
  );

  readonly missingRatio = computed(() => {
    const rows = this.profile().rowsScanned ?? 0;
    if (!rows) return 0;
    return this.missingTotal() / (rows * Math.max(this.colCount(), 1));
  });

  readonly primaryStats = computed(() => {
    const cols = this.profile().columns ?? [];

    const numeric = cols.filter(c => this.isNumeric(c.type));
    const categorical = cols.filter(c => this.isCategorical(c.type));
    const datetime = cols.filter(c => this.isDatetime(c.type));
    const boolean = cols.filter(c => this.isBoolean(c.type));
    const text = cols.filter(c => this.isText(c.type));

    return {
      numeric: numeric.length,
      categorical: categorical.length,
      datetime: datetime.length,
      boolean: boolean.length,
      text: text.length,
    };
  });

  readonly topProblemColumns = computed(() => {
    const rows = this.profile().rowsScanned ?? 0;
    const cols = (this.profile().columns ?? []).slice();
    cols.sort((a, b) => {
      const ar = rows ? (a.missing ?? 0) / rows : 0;
      const br = rows ? (b.missing ?? 0) / rows : 0;
      if (br !== ar) return br - ar;

      const au = a.uniqueValues ?? Number.POSITIVE_INFINITY;
      const bu = b.uniqueValues ?? Number.POSITIVE_INFINITY;
      return au - bu;
    });

    return cols.slice(0, 6);
  });
  readonly sampleContentColumns = computed(() => {
    const headers = this.profile().columns.map(c => c.name).join(', ');
    const rows = (this.profile().sampleRows ?? []).join("\n")
    return headers + "\n" + rows;
  });
  readonly samplePreview = computed(() => (this.profile().sampleRows ?? []).slice(0, 4));

  private readonly syncExpandedState = effect(() => {
    this.expand.set(this.initialExpanded());
  });

  trackByCol = (_: number, c: ColumnProfile) => c.name;

  fmtInt(n: number | undefined | null): string {
    if (n === undefined || n === null) return '—';
    return new Intl.NumberFormat(undefined, {maximumFractionDigits: 0}).format(n);
  }

  fmtPct(x: number | undefined | null): string {
    if (!x) return '0%';
    const pct = Math.max(0, Math.min(1, x)) * 100;
    return `${pct.toFixed(pct >= 10 ? 0 : 1)}%`;
  }

  fmtNum(n: number | undefined | null): string {
    if (n === undefined || n === null || Number.isNaN(n)) return '—';
    return new Intl.NumberFormat(undefined, {maximumFractionDigits: 3}).format(n);
  }

  typeLabel(t: string): string {
    const u = (t ?? '').toUpperCase();
    if (this.isNumeric(u)) return 'Number';
    if (this.isBoolean(u)) return 'Boolean';
    if (this.isDatetime(u)) return 'Datetime';
    if (this.isText(u)) return 'Text';
    if (this.isCategorical(u)) return 'Categorical';
    return u || 'Unknown';
  }

  typeIcon(t: string): string {
    const u = (t ?? '').toUpperCase();
    if (this.isNumeric(u)) return 'numbers';
    if (this.isBoolean(u)) return 'toggle_on';
    if (this.isDatetime(u)) return 'event';
    if (this.isText(u)) return 'text_fields';
    if (this.isCategorical(u)) return 'category';
    return 'help_outline';
  }

  isNumeric(t: string): boolean {
    const u = (t ?? '').toUpperCase();
    return u === 'INTEGER' || u === 'NUMBER' || u === 'FLOAT' || u === 'DOUBLE' || u === 'DECIMAL';
  }

  isBoolean(t: string): boolean {
    return (t ?? '').toUpperCase() === 'BOOLEAN';
  }

  isDatetime(t: string): boolean {
    const u = (t ?? '').toUpperCase();
    return u === 'DATETIME' || u === 'DATE' || u === 'TIMESTAMP';
  }

  isText(t: string): boolean {
    const u = (t ?? '').toUpperCase();
    return u === 'TEXT' || u === 'STRING';
  }

  isCategorical(t: string): boolean {
    const u = (t ?? '').toUpperCase();
    return u === 'CATEGORICAL' || u === 'CATEGORY' || u === 'ENUM';
  }

  toggleExpanded(): void {
    this.expand.update(e => !e);
  }
}
