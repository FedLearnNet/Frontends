import {Component, computed, inject, input, OnInit, signal} from '@angular/core';
import {SchemaService} from "@global-app/schema/services/schema.service";
import {SchemaNodeDTO, SchemaNodeType, SchemaStructureDTO} from "@global-app/schema/dto/schema";
import {MatDialog} from "@angular/material/dialog";
import {DetailSchemaCardComponent} from "@global-app/schema/components/detail-schema-card/detail-schema-card.component";
import {SchemaDetailDialog} from "@global-app/schema/model/schema";
import {cloneDeep} from "lodash";
import {
  SchemaCreateRootDialogComponent
} from "@global-app/schema/components/schema-create-root-dialog/schema-create-root-dialog.component";
import {NgStyle} from '@angular/common';
import {HeaderComponent} from "@shared-lib/components/header/header.component";
import {PageWrapperComponent} from "@shared-lib/components/page-wrapper/page-wrapper.component";
import {BadgeComponent} from "@shared-lib/components/badge/badge.component";
import {BtnComponent} from "@shared-lib/components/btn/btn.component";
import {MatIcon} from "@angular/material/icon";
import {MatIconButton} from "@angular/material/button";
import {EmptyStateComponent} from "@shared-lib/modules/app-execution/components/empty-state/empty-state.component";
import {InfoCardComponent} from "@shared-lib/components/info-card/info-card.component";
import {getSchemaName, isSchemaAttribute} from "@global-app/schema/utils/schema-utils";

interface SchemaOutlineRow {
  node: SchemaStructureDTO;
  parent?: SchemaStructureDTO;
  depth: number;
  childCount: number;
  valid: boolean;
  path: string;
  expandable: boolean;
  collapsed: boolean;
}

@Component({
  selector: 'app-detail-schema',
  templateUrl: './detail-schema.component.html',
  styleUrl: './detail-schema.component.scss',
  imports: [
    NgStyle,
    HeaderComponent,
    PageWrapperComponent,
    BadgeComponent,
    BtnComponent,
    MatIcon,
    MatIconButton,
    EmptyStateComponent,
    InfoCardComponent,
  ]
})
export class DetailSchemaComponent implements OnInit {
  readonly schemaService: SchemaService = inject(SchemaService);
  readonly dialog = inject(MatDialog);

  readonly schemaId = input<string>();

  readonly schema = signal<SchemaStructureDTO | undefined>(undefined);
  readonly loading = signal<boolean>(false);
  readonly error = signal<string | null>(null);
  readonly collapsedNodeIds = signal<Set<string>>(new Set<string>());

  ngOnInit(): void {
    if (this.schemaId() !== "new") {
      this.loadSchema();
    }
  }

  readonly pageTitle = computed(() => {
    const schema = this.schema();
    if (schema) return schema.name;
    if (this.schemaId() === 'new') return this.translateLabel('BUTTON.ADD_NEW_SCHEMA', 'New schema');
    return this.schemaId() ?? 'Schema detail';
  });

  readonly pageDescription = computed(() => {
    if (this.schemaId() === 'new' && !this.schema()) {
      return 'Start a shared schema with a root node, then add groups and attributes.';
    }
    return 'Maintain groups, attributes and mappings as a structured schema outline.';
  });

  readonly outlineRows = computed<SchemaOutlineRow[]>(() => {
    const schema = this.schema();
    if (!schema) return [];
    const rows: SchemaOutlineRow[] = [];

    const visit = (node: SchemaStructureDTO, depth: number, parent: SchemaStructureDTO | undefined, parentPath: string) => {
      const path = parentPath ? `${parentPath} / ${node.name}` : node.name;
      rows.push({
        node,
        parent,
        depth,
        childCount: node.children?.length ?? 0,
        valid: this.isNodeValid(node),
        path,
        expandable: this.isExpandableNode(node),
        collapsed: this.collapsedNodeIds().has(this.nodeKey(node)),
      });
      if (!this.collapsedNodeIds().has(this.nodeKey(node))) {
        (node.children ?? []).forEach(child => visit(child, depth + 1, node, path));
      }
    };

    visit(schema, 0, undefined, '');
    return rows;
  });

  readonly attributeCount = computed(() =>
    this.outlineRows().filter(row => isSchemaAttribute(row.node.type)).length
  );

  readonly invalidCount = computed(() =>
    this.outlineRows().filter(row => !row.valid).length
  );

  typeBadgeColor(row: SchemaOutlineRow): 'GRAY' | 'BLUE' | 'ORANGE' {
    if (!row.valid) return 'ORANGE';
    return isSchemaAttribute(row.node.type) ? 'BLUE' : 'GRAY';
  }

  ontologyLabel(node: SchemaStructureDTO): string {
    return node.ontology?.names?.join(', ') || node.ontology?.label || node.ontologyId || 'Missing ontology';
  }

  datatypeLabel(node: SchemaStructureDTO): string {
    return node.dataType?.name || node.dataType?.label || node.dataTypeId || 'Missing datatype';
  }

  toggleCollapsed(row: SchemaOutlineRow): void {
    if (!row.expandable) return;
    const key = this.nodeKey(row.node);
    this.collapsedNodeIds.update(collapsedNodeIds => {
      const next = new Set(collapsedNodeIds);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }

  loadSchema(): void {
    this.loading.set(true);
    this.error.set(null);
    this.schemaService.getSubStructure(this.schemaId()).subscribe({
      next: schema => {
        this.schema.set(schema);
        this.loading.set(false);
      },
      error: err => {
        this.error.set(err?.message ?? 'Error loading schema.');
        this.loading.set(false);
      }
    });
  }

  findNodeById(id: string): SchemaDetailDialog | null {
    const schema = this.schema();
    if (!schema) return null;
    const root = schema;

    function traverse(node: SchemaStructureDTO, parent: SchemaStructureDTO | undefined): SchemaDetailDialog | null {
      if (node.id === id || (!node.id && node.name === id)) {
        return {root: root, parent: parent, current: node};
      }
      if (node.children && node.children.length > 0) {
        for (const child of node.children) {
          const result = traverse(child, node);
          if (result) {
            return result;
          }
        }
      }
      return null;
    }

    return traverse(schema, undefined);
  }

  replaceNodeById(id: string, newNode: SchemaStructureDTO): boolean {
    const schema = cloneDeep(this.schema());
    if (!schema) return false;
    if (schema.id === id || (!schema.id && schema.name === id)) {
      this.schema.set({...schema, ...newNode, children: newNode.children ?? schema.children});
      return true;
    }

    function traverse(node: SchemaStructureDTO): boolean {
      if (!node.children || node.children.length === 0) {
        return false;
      }

      for (let i = 0; i < node.children.length; i++) {
        if (node.children[i].id === id || (!node.children[i].id && node.children[i].name === id)) {
          node.children[i] = {...node.children[i], ...newNode, children: newNode.children ?? node.children[i].children};
          return true;
        }
        const result = traverse(node.children[i]);
        if (result) {
          return true;
        }
      }

      return false;
    }

    const replaced = traverse(schema);
    if (replaced) {
      this.schema.set(schema);
    }
    return replaced;
  }

  addNodeToParentById(parentId: string, newNode: SchemaStructureDTO): boolean {
    const schema = cloneDeep(this.schema());
    if (!schema) return false;

    function traverse(node: SchemaStructureDTO): boolean {
      if (node.id === parentId || (!node.id && node.name === parentId)) {
        if (!node.children) {
          node.children = [];
        }
        node.children.push(newNode);
        return true;
      }
      if (node.children && node.children.length > 0) {
        for (const child of node.children) {
          const result = traverse(child);
          if (result) {
            return true;
          }
        }
      }

      return false;
    }

    const added = traverse(schema);
    if (added) {
      this.schema.set(schema);
    }
    return added;
  }

  deleteNodeById(id: string): boolean {
    const schema = cloneDeep(this.schema());
    if (!schema || schema.id === id || (!schema.id && schema.name === id)) return false;

    function traverse(node: SchemaStructureDTO): boolean {
      if (!node.children || node.children.length === 0) {
        return false;
      }

      for (let i = 0; i < node.children.length; i++) {
        if (node.children[i].id === id || (!node.children[i].id && node.children[i].name === id)) {
          node.children.splice(i, 1);
          return true;
        }
        const result = traverse(node.children[i]);
        if (result) {
          return true;
        }
      }

      return false;
    }

    const deleted = traverse(schema);
    if (deleted) {
      this.schema.set(schema);
    }
    return deleted;
  }

  editSchema(row?: SchemaOutlineRow): void {
    const id = row?.node.id ?? row?.node.name;
    if (!id) return;
    const schemaGroup = cloneDeep(this.findNodeById(id));
    const dialogRef = this.dialog.open(DetailSchemaCardComponent, {
      height: '80vh',
      width: '90vw',
      maxWidth: '100vw',
      maxHeight: '100vh',
      autoFocus: false,
      data: schemaGroup
    });

    dialogRef.afterClosed().subscribe((result?: SchemaStructureDTO) => {
      if (result === undefined || (result as any) === "") {
        return;
      }
      this.loading.set(true);
      this.schemaService.update(this.toSchemaNodeDTO(result, schemaGroup?.parent?.id)).subscribe({
        next: updatedSchema => {
          this.replaceNodeById(id, {...result, ...updatedSchema});
          this.loadSchema();
        },
        error: err => {
          this.error.set(err?.message ?? 'Error updating schema node.');
          this.loading.set(false);
        }
      });
    });
  }

  createRoot(): void {
    const dialogRef = this.dialog.open(SchemaCreateRootDialogComponent);

    dialogRef.afterClosed().subscribe((result?: SchemaStructureDTO) => {
      if (result !== undefined) {
        this.schema.set({...result, children: []});
      }
    });
  }

  addChildren(row?: SchemaOutlineRow): void {
    const id = row?.node.id ?? row?.node.name;
    if (!id) return;

    const schemaGroup = cloneDeep(this.findNodeById(id));
    if (!schemaGroup) {
      return;
    }
    schemaGroup.parent = schemaGroup.current;
    schemaGroup.current = {name: '', description: '', type: SchemaNodeType.ATOMIC_ATTRIBUTE} as SchemaStructureDTO;

    const dialogRef = this.dialog.open(DetailSchemaCardComponent, {
      data: schemaGroup
    });

    dialogRef.afterClosed().subscribe((result?: SchemaStructureDTO) => {
      if (result !== undefined) {
        this.loading.set(true);
        this.schemaService.persist(this.toSchemaNodeDTO(result, id)).subscribe({
          next: createdSchema => {
            this.addNodeToParentById(id, {...result, ...createdSchema});
            this.loadSchema();
          },
          error: err => {
            this.error.set(err?.message ?? 'Error creating schema node.');
            this.loading.set(false);
          }
        });
      }
    });
  }

  deleteSchema(row?: SchemaOutlineRow): void {
    const id = row?.node.id ?? row?.node.name;
    if (!id) return;
    this.loading.set(true);
    this.schemaService.delete(id).subscribe({
      next: () => {
        this.deleteNodeById(id);
        this.loading.set(false);
      },
      error: err => {
        this.error.set(err?.message ?? 'Error deleting schema node.');
        this.loading.set(false);
      }
    });
  }

  private isNodeValid(node: SchemaStructureDTO): boolean {
    const validBase = !!(node.name && node.description && node.type);
    if (!validBase) return false;
    if (isSchemaAttribute(node.type)) {
      return !!(node.dataTypeId && node.ontologyId);
    }
    return true;
  }

  private isExpandableNode(node: SchemaStructureDTO): boolean {
    return !isSchemaAttribute(node.type) && (node.children?.length ?? 0) > 0;
  }

  private nodeKey(node: SchemaStructureDTO): string {
    return node.id || node.name;
  }

  private translateLabel(_key: string, fallback: string): string {
    return fallback;
  }

  private toSchemaNodeDTO(node: SchemaStructureDTO, parentId?: string): SchemaNodeDTO {
    const {children, ontology, dataType, ...dto} = node;
    return {
      ...dto,
      parentId: parentId ?? dto.parentId,
    } as SchemaNodeDTO;
  }

  protected readonly SchemaNodeType = SchemaNodeType;
  protected readonly isSchemaAttribute = isSchemaAttribute;
  protected readonly getSchemaName = getSchemaName;
}
