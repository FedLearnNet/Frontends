import {ChangeDetectionStrategy, Component, computed, inject, input} from '@angular/core';
import {CsvFileSchemaField} from "@shared-lib/models/data-statistics";
import {DataStatistics} from "@shared-lib/services/data-statistics";


@Component({
  selector: 'lib-csv-file-schema-card',
  imports: [],
  templateUrl: './csv-file-schema-card.component.html',
  styleUrl: './csv-file-schema-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CsvFileSchemaCardComponent {
  private readonly dataStatistics: DataStatistics = inject(DataStatistics);
  columns = input.required<string[]>();
  rows = input.required<Array<Record<string, any>>>();

  schema = computed<CsvFileSchemaField[]>(() => {
    if (!this.rows().length) return [];
    const rows = this.rows();
    const cols = this.columns();
    return cols.map(col => {
      const type: CsvFileSchemaField['type'] = this.dataStatistics.detectArrayKind(rows, col);
      return {name: col, type};
    });
  });


}
