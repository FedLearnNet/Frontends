import {Component, OnInit, inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import {isEmpty} from 'lodash';
import {MatTreeModule, MatTreeNestedDataSource} from '@angular/material/tree';
import {SelectionModel} from '@angular/cdk/collections';
import {MatDivider} from '@angular/material/divider';
import {MatCheckbox} from '@angular/material/checkbox';
import {MatButtonModule} from '@angular/material/button';
import {TranslatePipe} from '@ngx-translate/core';
import {MatIcon} from '@angular/material/icon';
import {isSchemaDataColumnNode, SchemaNodeNestedDto} from '@local-app/cohort/dto/schema';

export interface DynamicColumnNode {
  id: number;
  name: string;
  disabled: boolean;
  children: DynamicColumnNode[];
}

export interface PatientDetailGridSettingsData {
  schemaDynamicFormConfig: SchemaNodeNestedDto[];
  visibleColumns: number[];
}

@Component({
  selector: 'app-patient-detail-grid-settings',
  templateUrl: './patient-detail-grid-settings.component.html',
  styleUrl: './patient-detail-grid-settings.component.scss',
  imports: [
    MatDivider,
    MatTreeModule,
    MatDialogModule,
    MatCheckbox,
    MatButtonModule,
    TranslatePipe,
    MatIcon
  ]
})
export class PatientDetailGridSettingsComponent implements OnInit {
  private readonly dialogRef = inject<MatDialogRef<PatientDetailGridSettingsComponent, number[] | undefined>>(MatDialogRef);
  readonly data = inject<PatientDetailGridSettingsData>(MAT_DIALOG_DATA);

  readonly dataSource = new MatTreeNestedDataSource<DynamicColumnNode>();
  readonly checklistSelection = new SelectionModel<DynamicColumnNode>(true);

  readonly childrenAccessor = (node: DynamicColumnNode) => node.children;
  readonly trackNode = (_: number, node: DynamicColumnNode) => node.id;

  private readonly parentMap = new Map<DynamicColumnNode, DynamicColumnNode | null>();

  readonly hasChild = (_: number, node: DynamicColumnNode) => node.children.length > 0;

  ngOnInit(): void {
    this.dataSource.data = this.setSchemaStructure(this.data.schemaDynamicFormConfig);
    this.rebuildParentMap();
    this.initializeSelections();
    this.checkParentSelections();
  }

  descendantsAllSelected(node: DynamicColumnNode): boolean {
    const descendants = this.getDescendants(node);
    return descendants.length > 0 && descendants.every(child => this.checklistSelection.isSelected(child));
  }

  descendantsPartiallySelected(node: DynamicColumnNode): boolean {
    const descendants = this.getDescendants(node);
    const hasSelectedDescendant = descendants.some(child => this.checklistSelection.isSelected(child));
    return hasSelectedDescendant && !this.descendantsAllSelected(node);
  }

  dynamicColumnSelectionToggle(node: DynamicColumnNode, checked: boolean): void {
    const descendants = this.getDescendants(node);
    if (checked) {
      this.checklistSelection.select(node, ...descendants);
    } else {
      this.checklistSelection.deselect(node, ...descendants);
    }
    this.checkAllParentsSelection(node);
  }

  dynamicColumnLeafItemSelectionToggle(node: DynamicColumnNode, checked: boolean): void {
    if (checked) {
      this.checklistSelection.select(node);
    } else {
      this.checklistSelection.deselect(node);
    }
    this.checkAllParentsSelection(node);
  }

  isDisabled(node: DynamicColumnNode): boolean {
    return node.disabled || (this.getParentNode(node)?.disabled ?? false);
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSubmit(): void {
    const selectedIds = [...new Set(
      this.checklistSelection.selected
        .filter(node => node.children.length === 0)
        .map(node => node.id)
    )];
    this.dialogRef.close(selectedIds);
  }

  private checkAllParentsSelection(node: DynamicColumnNode): void {
    let parent = this.getParentNode(node);
    while (parent) {
      this.checkRootNodeSelection(parent);
      parent = this.getParentNode(parent);
    }
  }

  private checkRootNodeSelection(node: DynamicColumnNode): void {
    const nodeSelected = this.checklistSelection.isSelected(node);
    const descendants = this.getDescendants(node);
    const allDescendantsSelected = descendants.every(child => this.checklistSelection.isSelected(child));

    if (nodeSelected && !allDescendantsSelected) {
      this.checklistSelection.deselect(node);
    } else if (!nodeSelected && allDescendantsSelected) {
      this.checklistSelection.select(node);
    }
  }

  private getParentNode(node: DynamicColumnNode): DynamicColumnNode | null {
    return this.parentMap.get(node) ?? null;
  }

  private getDescendants(node: DynamicColumnNode): DynamicColumnNode[] {
    const descendants: DynamicColumnNode[] = [];
    const visit = (children: DynamicColumnNode[]) => {
      for (const child of children) {
        descendants.push(child);
        if (child.children.length > 0) {
          visit(child.children);
        }
      }
    };

    visit(node.children);
    return descendants;
  }

  private setSchemaStructure(formConfig: SchemaNodeNestedDto[] | undefined): DynamicColumnNode[] {
    if (!formConfig || isEmpty(formConfig)) {
      return [];
    }

    return formConfig.map(formElement => {
      if (isSchemaDataColumnNode(formElement)) {
        return {
          id: formElement.id,
          name: formElement.name,
          disabled: false,
          children: [],
        };
      }

      return {
        id: formElement.id,
        name: formElement.name,
        disabled: false,
        children: this.setSchemaStructure(formElement.childNodes),
      };
    });
  }

  private rebuildParentMap(): void {
    this.parentMap.clear();
    this.buildParentMap(this.dataSource.data);
  }

  private buildParentMap(nodes: DynamicColumnNode[], parent: DynamicColumnNode | null = null): void {
    for (const node of nodes) {
      this.parentMap.set(node, parent);
      if (node.children.length > 0) {
        this.buildParentMap(node.children, node);
      }
    }
  }

  private initializeSelections(): void {
    const selectVisible = (nodes: DynamicColumnNode[]) => {
      for (const node of nodes) {
        if (this.data.visibleColumns.includes(node.id)) {
          this.checklistSelection.select(node);
        }
        if (node.children.length > 0) {
          selectVisible(node.children);
        }
      }
    };

    selectVisible(this.dataSource.data);
  }

  private checkParentSelections(): void {
    const nodes = [...this.parentMap.keys()].reverse();
    for (const node of nodes) {
      const parentNode = this.getParentNode(node);
      if (parentNode && this.descendantsAllSelected(parentNode) && !this.checklistSelection.isSelected(parentNode)) {
        this.checklistSelection.select(parentNode);
      }
    }
  }
}
