import {Component, computed, input} from '@angular/core';
import {BadgeComponent} from "@shared-lib/components/badge/badge.component";
import {ColumnRuleDTO, TabularSchemaDTO} from "@shared-lib/modules/app-execution/dto/config";

@Component({
  selector: 'app-app-detail-config-table-preview',
  imports: [
    BadgeComponent
  ],
  templateUrl: './app-detail-config-table-preview.component.html',
  styleUrl: './app-detail-config-table-preview.component.scss',
})
export class AppDetailConfigTablePreviewComponent {
  schema = input.required<TabularSchemaDTO>();

  readonly csvHeader = computed(() => {
    const dto = this.schema();
    const keys = Object.keys(dto.columns ?? {});
    if (!keys.length) return '';
    return keys.join(',');
  });

  readonly csvExampleRow = computed(() => {
    const dto = this.schema();
    const cols = dto.columns ?? {};
    const keys = Object.keys(cols);
    if (!keys.length) return '';

    const exampleCell = (rule?: ColumnRuleDTO) => {
      const t = rule?.type ?? 'STRING';
      switch (t) {
        case 'INTEGER':
          return '1';
        case 'FLOAT':
          return '1.23';
        case 'BOOLEAN':
          return 'true';
        default:
          return 'value';
      }
    };

    return keys.map(k => exampleCell(cols[k])).join(',');
  });
  protected readonly Object = Object;
}
