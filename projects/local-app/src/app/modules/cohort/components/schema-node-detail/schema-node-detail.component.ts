import {Component, computed, input} from '@angular/core';
import {SchemaNodeDto, SchemaNodeTypeEnum, SchemaRootNodeDto} from "@local-app/cohort/dto/schema";
import {MatIconModule} from "@angular/material/icon";
import {BadgeComponent} from "@shared-lib/components/badge/badge.component";
import {KeyValuePipe} from "@angular/common";
import {DataTypeOptionsDto, DataTypeValidationDto} from "@local-app/cohort/dto/data-type";
import {InfoCardComponent} from "@shared-lib/components/info-card/info-card.component";
import {InfoGridComponent} from "@shared-lib/components/info-grid/info-grid.component";

export type SchemaNodeDetailData = SchemaNodeDto | SchemaRootNodeDto;

@Component({
  selector: 'app-schema-node-detail',
  imports: [
    MatIconModule,
    BadgeComponent,
    KeyValuePipe,
    InfoCardComponent,
    InfoGridComponent
  ],
  templateUrl: './schema-node-detail.component.html',
  styleUrl: './schema-node-detail.component.scss',
})
export class SchemaNodeDetailComponent {
  node = input.required<SchemaNodeDetailData>();
  protected readonly SchemaNodeTypeEnum = SchemaNodeTypeEnum;

  get data(): SchemaNodeDetailData {
    return this.node();
  }

  readonly ontology = computed(() => {
    const node = this.node();
    return this.isSchemaNode(node) ? node.ontology : undefined;
  });
  readonly dataType = computed(() => {
    const node = this.node();
    return this.isSchemaNode(node) ? node.dataType : undefined;
  });
  readonly isStructuralNode = computed(() => this.node().nodeType !== SchemaNodeTypeEnum.ATTRIBUTE && this.node().nodeType !== SchemaNodeTypeEnum.LIST_ATTRIBUTE);
  readonly allowedValueLabels = computed(() => {
    const dt = this.dataType();
    const values = dt?.options?.length ? dt.options : dt?.allowedValues ?? [];
    return values.map(option => this.optionLabel(option));
  });
  readonly parentId = computed(() => {
    const node = this.node();
    return this.isSchemaNode(node) ? node.parentId : undefined;
  });
  readonly childCount = computed(() => {
    const childNodes = (this.node() as SchemaRootNodeDto | { childNodes?: SchemaNodeDto[] }).childNodes;
    const childrenIds = (this.node() as SchemaNodeDto).childrenIds;
    return childNodes?.length ?? childrenIds?.length ?? 0;
  });

  hasMapping(mapping?: Record<string, string>): boolean {
    return !!mapping && Object.keys(mapping).length > 0;
  }

  optionLabel(option: DataTypeOptionsDto | string | boolean | number): string {
    if (typeof option === 'object' && option !== null && 'label' in option) {
      return `${option.label} (${option.value})`;
    }

    return `${option}`;
  }

  validationLabel(validation: DataTypeValidationDto): string {
    return [
      validation.name,
      validation.validator ? `: ${validation.validator}` : '',
      validation.message ? ` - ${validation.message}` : ''
    ].join('');
  }

  display(value: string | number | boolean | null | undefined, fallback = 'Not set'): string {
    if (value === null || value === undefined || value === '') {
      return fallback;
    }

    return `${value}`;
  }

  private isSchemaNode(node: SchemaNodeDetailData): node is SchemaNodeDto {
    return 'ontology' in node || 'dataType' in node;
  }
}
