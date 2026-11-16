import {Component, computed, input, ChangeDetectionStrategy} from '@angular/core';
import {isAttributeNode, SchemaNodeDto, SchemaNodeTypeEnum, SchemaRootNodeDto} from "@local-app/cohort/dto/schema";
import {MatIconModule} from "@angular/material/icon";
import {BadgeComponent} from "@shared-lib/components/badge/badge.component";
import {
  dataTypeAllowedValueLabels,
  DataTypeValidationDto,
  dataTypeValidationLabel
} from "@local-app/cohort/dto/data-type";
import {InfoCardComponent} from "@shared-lib/components/info-card/info-card.component";
import {InfoGridComponent} from "@shared-lib/components/info-grid/info-grid.component";

export type SchemaNodeDetailData = SchemaNodeDto | SchemaRootNodeDto;

@Component({
  selector: 'app-schema-node-detail',
  imports: [
    MatIconModule,
    BadgeComponent,
    InfoCardComponent,
    InfoGridComponent
  ],
  templateUrl: './schema-node-detail.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
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
  readonly isAttribute = computed(() => isAttributeNode(this.node()));
  readonly isStructuralNode = computed(() => !this.isAttribute());
  readonly allowedValueLabels = computed(() => dataTypeAllowedValueLabels(this.dataType()));
  readonly parentId = computed(() => {
    const node = this.node();
    return this.isSchemaNode(node) ? node.parentId : undefined;
  });
  readonly childCount = computed(() => {
    const childNodes = (this.node() as SchemaRootNodeDto | { childNodes?: SchemaNodeDto[] }).childNodes;
    const childrenIds = (this.node() as SchemaNodeDto).childrenIds;
    return childNodes?.length ?? childrenIds?.length ?? 0;
  });

  validationLabel(validation: DataTypeValidationDto): string {
    return dataTypeValidationLabel(validation);
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
