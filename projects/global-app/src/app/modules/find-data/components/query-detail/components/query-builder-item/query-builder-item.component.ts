import { Component, Output, EventEmitter, Input } from '@angular/core';
import { SelectOption } from '@shared-lib/models';

@Component({
  selector: 'app-query-builder-item',
  templateUrl: './query-builder-item.component.html',
  styleUrl: './query-builder-item.component.scss',
})
export class QueryBuilderItemComponent {
  @Input() queryItem: any;
  @Output() removeQueryItem = new EventEmitter<number>();

  columns: SelectOption[] = [
    {
      value: 'age',
      label: 'Age',
      // type: number,
    },
    {
      value: 'microbiome_file',
      label: 'Microbiome file',
      // type: boolean,
    },
    {
      value: 'dietary_score',
      label: 'Dietary score',
      // type: number,
    },
    {
      value: 'colorectal_cancer',
      label: 'Colorectal cancer',
      // type: boolean,
    },
  ];

  numberOptions: SelectOption[] = [
    {
      value: 0,
      label: '=',
    },
    {
      value: 1,
      label: '!=',
    },
    {
      value: 2,
      label: '>=',
    },
    {
      value: 3,
      label: '<',
    },
    {
      value: 4,
      label: '<=',
    },
  ];

  stringOptions: SelectOption[] = [
    {
      value: 0,
      label: 'contains',
    },
    {
      value: 1,
      label: 'does not contains',
    },
    {
      value: 2,
      label: 'equals',
    },
    {
      value: 3,
      label: 'does not equals',
    },
    {
      value: 4,
      label: 'begins with',
    },
    {
      value: 5,
      label: 'ends with',
    },
    {
      value: 6,
      label: 'is blank',
    },
    {
      value: 7,
      label: 'is not blank',
    },
  ];

  booleanOptions: SelectOption[] = [
    {
      value: 0,
      label: 'false',
    },
    {
      value: 1,
      label: 'true',
    },
    {
      value: 2,
      label: 'is blank',
    },
    {
      value: 3,
      label: 'is not blank',
    },
  ];

  onRemoveQueryItem(): void {
    this.removeQueryItem.emit(this.queryItem.id);
  }
}
