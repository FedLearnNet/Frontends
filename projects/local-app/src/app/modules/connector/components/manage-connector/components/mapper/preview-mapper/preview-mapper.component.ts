import {Component, computed, input, signal} from '@angular/core';
import {ConnectorMappingElement} from '../../../../../models/connector-preview';
import {CohortDetailDto} from '@local-app/cohort/models';
import {SchemaNodeNestedDto, SchemaNodeTypeEnum} from '@local-app/cohort/dto/schema';
import {MatToolbar} from '@angular/material/toolbar';
import {MatButtonToggle, MatButtonToggleGroup} from '@angular/material/button-toggle';
import {FormsModule} from '@angular/forms';
import {NgTemplateOutlet} from '@angular/common';
import {TranslatePipe} from '@ngx-translate/core';
import {UNIQUE_PATIENT_ID_NODE} from '@local-app/utils/constants/unique-patient-id-node';
import {MatIcon} from '@angular/material/icon';
import {ConnectorMappingMode} from '../../../../../models/connector-value-mapping';
import {BadgeColor, BadgeComponent} from '@shared-lib/components/badge/badge.component';

export enum MappedFilter {
  Mapped = 'Mapped',
  Unmapped = 'Unmapped',
}

export enum RequiredFilter {
  Required = 'Required',
  NotRequired = 'NotRequired',
}

export interface VisibleSchemaNode {
  node: SchemaNodeNestedDto;
  children: VisibleSchemaNode[];
}

export interface MappingPreviewEntry {
  mode: ConnectorMappingMode;
  modeLabel: string;
  modeColor: BadgeColor;
  description: string;
}

@Component({
  selector: 'app-preview-mapper',
  templateUrl: './preview-mapper.component.html',
  styleUrls: ['./preview-mapper.component.scss'],
  imports: [
    MatToolbar,
    MatButtonToggleGroup,
    FormsModule,
    MatButtonToggle,
    NgTemplateOutlet,
    TranslatePipe,
    MatIcon,
    BadgeComponent,
  ],
})
export class ConnectorPreviewMapperComponent {
  cohort = input.required<CohortDetailDto>();
  mappingConfig = input.required<ConnectorMappingElement[]>();

  filterMapped = signal<MappedFilter[]>([]);
  filterRequired = signal<RequiredFilter[]>([]);

  private schemaRoot = computed(() =>
    this.cohort()?.schemaRoot?.childNodes ?? []
  );

  readonly visibleTree = computed<VisibleSchemaNode[]>(() =>
    this.schemaRoot()
      .map(node => this.buildVisibleNode(node))
      .filter((n): n is VisibleSchemaNode => n !== null)
  );

  readonly previewStats = computed(() => {
    const flatten = (nodes: SchemaNodeNestedDto[]): SchemaNodeNestedDto[] =>
      nodes.flatMap(node => [node, ...(node.childNodes?.length ? flatten(node.childNodes) : [])]);

    const allNodes = flatten(this.schemaRoot());
    const attributes = allNodes.filter(node => this.isAttribute(node));
    const mappedAttributes = attributes.filter(node => !!this.getMapping(node));
    const requiredAttributes = attributes.filter(node => this.isRequired(node));
    const requiredMapped = requiredAttributes.filter(node => !!this.getMapping(node));

    return {
      total: attributes.length,
      mapped: mappedAttributes.length,
      unmapped: Math.max(attributes.length - mappedAttributes.length, 0),
      required: requiredAttributes.length,
      requiredMapped: requiredMapped.length,
    };
  });

  readonly coverage = computed(() => {
    const total = this.previewStats().total;
    if (!total) {
      return 0;
    }

    return Math.round((this.previewStats().mapped / total) * 100);
  });

  private mappedGlobalIds = computed(() => {
    const values =
      this.mappingConfig()
        .flatMap(m => [
          m.mappingConfig?.value,
          ...(m.valueMappingConfig?.valueMappings.map(mapping => mapping.value) ?? []),
        ])
        .filter((v): v is string => !!v);

    return (fieldId: string) =>
      values.some(v => v === fieldId || v.endsWith(`.${fieldId}`));
  });

  private buildVisibleNode(
    node: SchemaNodeNestedDto
  ): VisibleSchemaNode | null {

    if (this.isAttribute(node)) {
      const visible =
        this.passesMapped(node) && this.passesRequired(node);

      return visible
        ? {node, children: []}
        : null;
    }

    const visibleChildren =
      node.childNodes
        ?.map(child => this.buildVisibleNode(child))
        .filter((c): c is VisibleSchemaNode => c !== null) ?? [];

    if (visibleChildren.length === 0) {
      return null;
    }

    return {
      node,
      children: visibleChildren
    };
  }

  private passesMapped(field: SchemaNodeNestedDto): boolean {
    if (!this.isAttribute(field)) return true;

    const selected = this.filterMapped();
    if (!selected.length) return true;

    const fieldId = field.globalId !== UNIQUE_PATIENT_ID_NODE.globalId
      ? field.name
      : UNIQUE_PATIENT_ID_NODE.name;
    const mapped = this.mappedGlobalIds()(fieldId);

    if (
      selected.includes(MappedFilter.Mapped) &&
      selected.includes(MappedFilter.Unmapped)
    ) {
      return true;
    }

    return selected.includes(MappedFilter.Mapped)
      ? mapped
      : !mapped;
  }

  private passesRequired(field: SchemaNodeNestedDto): boolean {
    if (!this.isAttribute(field)) return true;

    const selected = this.filterRequired();
    if (!selected.length) return true;

    const isReq = this.isRequired(field);

    if (
      selected.includes(RequiredFilter.Required) &&
      selected.includes(RequiredFilter.NotRequired)
    ) {
      return true;
    }

    return selected.includes(RequiredFilter.Required)
      ? isReq
      : !isReq;
  }

  isRequired(field: SchemaNodeNestedDto): boolean {
    if (this.isGroup(field) || !field.dataType) {
      return false;
    }

    if ((field.dataType.validations?.length ?? 0) === 0) {
      return false;
    }

    return !!field.dataType.isRequired;
  }

  private isGroup(node: SchemaNodeNestedDto): boolean {
    return node.nodeType === SchemaNodeTypeEnum.GROUP;
  }

  private isAttribute(node: SchemaNodeNestedDto): boolean {
    return node.nodeType === SchemaNodeTypeEnum.ATTRIBUTE
      || node.nodeType === SchemaNodeTypeEnum.ATOMIC_ATTRIBUTE
      || node.nodeType === SchemaNodeTypeEnum.LIST_ATTRIBUTE;
  }

  protected getMapping(field: SchemaNodeNestedDto): string | undefined {
    const descriptions = this.getMappingEntries(field).map(entry => entry.description);
    return descriptions.length ? descriptions.join(', ') : undefined;
  }

  protected getMappingEntries(field: SchemaNodeNestedDto): MappingPreviewEntry[] {
    const fieldGlobalId = field.globalId !== UNIQUE_PATIENT_ID_NODE.globalId
      ? field.name
      : UNIQUE_PATIENT_ID_NODE.name;

    return this.mappingConfig().flatMap(mappingElement => {
      const direct = mappingElement.mappingConfig?.value;
      const directEntries: MappingPreviewEntry[] = direct && this.matchesField(direct, fieldGlobalId)
        ? [{
          mode: ConnectorMappingMode.DIRECT,
          modeLabel: 'DIALOG.MAPPER.MODE_DIRECT',
          modeColor: 'GRAY',
          description: mappingElement.column,
        }]
        : [];
      const valueEntries = mappingElement.valueMappingConfig?.valueMappings
        .filter(mapping => this.matchesField(mapping.value, fieldGlobalId))
        .map(mapping => {
          const mode = mappingElement.valueMappingConfig!.mode;
          const oneHot = mode === ConnectorMappingMode.ONE_HOT;
          return {
            mode,
            modeLabel: oneHot ? 'DIALOG.MAPPER.MODE_ONE_HOT' : 'DIALOG.MAPPER.MODE_VALUE_COLUMN',
            modeColor: oneHot ? 'BLUE' : 'ORANGE',
            description: oneHot
              ? `${mappingElement.valueMappingConfig!.mappingColumn} = ${mapping.sourceValue}`
              : `${mappingElement.valueMappingConfig!.valueColumn} via ${mappingElement.valueMappingConfig!.mappingColumn} = ${mapping.sourceValue}`,
          } satisfies MappingPreviewEntry;
        })
        ?? [];
      return [...directEntries, ...valueEntries];
    });
  }

  private matchesField(mappingPath: string, fieldName: string): boolean {
    return mappingPath === fieldName || mappingPath.endsWith(`.${fieldName}`);
  }

  protected hasVisibleNodes(): boolean {
    return this.visibleTree().length > 0;
  }

  protected readonly RequiredFilter = RequiredFilter;
  protected readonly MappedFilter = MappedFilter;
}
