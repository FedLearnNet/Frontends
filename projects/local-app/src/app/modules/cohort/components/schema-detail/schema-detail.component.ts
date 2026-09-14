import {Component, computed, effect, inject, input, signal} from '@angular/core';
import {isEmpty} from 'lodash';
import {MatIconModule} from '@angular/material/icon';
import {MatTableModule} from '@angular/material/table';
import {TranslatePipe} from '@ngx-translate/core';
import {MatButtonModule} from '@angular/material/button';
import {DynamicFormService} from '@local-app/cohort/services/dynamic-form.service';
import {SchemaNodeNestedDto, SchemaNodeTypeEnum, SchemaRootNodeDto} from "@local-app/cohort/dto/schema";
import {SchemaDetailTreeComponent} from "@local-app/cohort/components/schema-detail-tree/schema-detail-tree.component";
import {MatButtonToggleModule} from "@angular/material/button-toggle";
import {FormsModule} from "@angular/forms";
import { MatTooltipModule } from '@angular/material/tooltip';
import {HeaderComponent} from "@shared-lib/components/header/header.component";
import {PageWrapperComponent} from "@shared-lib/components/page-wrapper/page-wrapper.component";
import {BtnComponent} from "@shared-lib/components/btn/btn.component";
import {MatDialog} from "@angular/material/dialog";
import {
  SchemaNodeDetailDialogComponent
} from "@local-app/cohort/components/schema-node-detail-dialog/schema-node-detail-dialog.component";

export interface DynamicColumnNode {
  id?: string;
  name: string;
  label?: string;
  description?: string;
  dataType?: string;
  dataTypeDescription?: string;
  disabled?: boolean;
  children?: DynamicColumnNode[];
  node: SchemaNodeNestedDto;
}

export interface DynamicColumnFlatNode {
  id?: string;
  name: string;
  label?: string;
  description?: string;
  dataType?: string;
  dataTypeDescription?: string;
  level: number;
  disabled?: boolean;
  expandable: boolean;
  parentId?: string;
  node: SchemaNodeNestedDto;
}

@Component({
  selector: 'app-schema-detail',
  templateUrl: './schema-detail.component.html',
  styleUrl: './schema-detail.component.scss',
  standalone: true,
  imports: [
      MatIconModule,
      MatTableModule,
      TranslatePipe,
      MatButtonModule,
      SchemaDetailTreeComponent,
      MatButtonToggleModule,
      FormsModule,
      MatTooltipModule,
      HeaderComponent,
      PageWrapperComponent,
      BtnComponent,
  ]
})
export class SchemaDetailComponent {
  private readonly dynamicFormService = inject(DynamicFormService);
  private readonly dialog = inject(MatDialog);

  schema = input.required<SchemaRootNodeDto>();
  viewState = signal<'table' | 'diagram'>('table');
  displayedColumns = signal<string[]>(['name', 'description', 'dataType', 'actions']);

  private readonly tree = signal<DynamicColumnNode[]>([]);
  private readonly expandedIds = signal<Set<string>>(new Set());

  private readonly _rebuild = effect(() => {
    const s = this.schema();

    const formCfg = this.dynamicFormService.getDynamicFormConfig(s.childNodes);
    this.tree.set(this.buildTree(formCfg));
    this.expandedIds.set(new Set());
  });

  flatRows = computed<DynamicColumnFlatNode[]>(() =>
    this.flatten(this.tree(), this.expandedIds())
  );

  toggle(row: DynamicColumnFlatNode) {
    if (!row.expandable) return;
    const next = new Set(this.expandedIds());
    const id = row.id ?? row.name;
    if (next.has(id)) {
      next.delete(id)
    } else {
      next.add(id)
    }
    this.expandedIds.set(next);
  }

  isExpanded = (row: DynamicColumnFlatNode) => {
    const id = row.id ?? row.name;
    return this.expandedIds().has(id);
  };

  openSchemaNodeDetail(node: SchemaNodeNestedDto | SchemaRootNodeDto): void {
    this.dialog.open(SchemaNodeDetailDialogComponent, {
      data: node,
      height: '80vh',
      width: '90vw',
      maxWidth: '100vw',
      maxHeight: '100vh',
      autoFocus: false,
    });
  }

  private buildTree(formConfig?: SchemaNodeNestedDto[]): DynamicColumnNode[] {
    if (!formConfig || isEmpty(formConfig)) return [];
    const out: DynamicColumnNode[] = [];

    for (const fe of formConfig) {
      if (fe.nodeType === SchemaNodeTypeEnum.ATTRIBUTE ||
        fe.nodeType === SchemaNodeTypeEnum.ATOMIC_ATTRIBUTE ||
        fe.nodeType === SchemaNodeTypeEnum.LIST_ATTRIBUTE) {
        out.push({
          id: "" + fe.id,
          name: fe.name,
          label: fe.dataType.name,
          description: fe.description,
          dataType: fe.dataType.type,
          dataTypeDescription: fe.dataType.description,
          disabled: false,
          node: fe
        });
        continue;
      }

      out.push({
        id: fe.id ? ("" + fe.id) : fe.name,
        name: fe.name,
        label: fe.name,
        description: fe.description,
        dataTypeDescription: fe.description,
        disabled: false,
        children: this.buildTree(fe.childNodes),
        node: fe
      });
    }

    return out;
  }

  private flatten(
    nodes: DynamicColumnNode[],
    expanded: Set<string>,
    level = 0,
    parentId?: string
  ): DynamicColumnFlatNode[] {
    const rows: DynamicColumnFlatNode[] = [];
    for (const n of nodes) {
      const id = n.id ?? n.name;
      const expandable = !!(n.children && n.children.length);
      rows.push({
        id,
        name: n.name,
        label: n.label,
        description: n.description,
        dataType: n.dataType,
        dataTypeDescription: n.dataTypeDescription,
        disabled: n.disabled,
        level,
        expandable,
        parentId,
        node: n.node
      });

      if (expandable && expanded.has(id)) {
        rows.push(...this.flatten(n.children!, expanded, level + 1, id));
      }
    }
    return rows;
  }
}
