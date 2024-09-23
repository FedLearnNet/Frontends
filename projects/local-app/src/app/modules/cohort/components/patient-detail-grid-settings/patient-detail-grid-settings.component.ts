import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { isEmpty } from 'lodash';
import { FlatTreeControl } from '@angular/cdk/tree';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';
import { SelectionModel } from '@angular/cdk/collections';
import { SchemaFieldStructure } from '@shared-lib/models';

export class DynamicColumnNode {
    id: string;
    name: string;
    disabled: boolean;
    children: DynamicColumnNode[];
}

export class DynamicColumnFlatNode {
    id: string;
    name: string;
    level: number;
    disabled: boolean;
    expandable: boolean;
}

@Component({
    selector: 'app-patient-detail-grid-settings',
    templateUrl: './patient-detail-grid-settings.component.html',
    styleUrl: './patient-detail-grid-settings.component.scss'
})
export class PatientDetailGridSettingsComponent implements OnInit {
    flatNodeMap = new Map<DynamicColumnFlatNode, DynamicColumnNode>();
    nestedNodeMap = new Map<DynamicColumnNode, DynamicColumnFlatNode>();

    treeControl: FlatTreeControl<DynamicColumnFlatNode>;
    treeFlattener: MatTreeFlattener<DynamicColumnNode, DynamicColumnFlatNode>;
    dataSource: MatTreeFlatDataSource<DynamicColumnNode, DynamicColumnFlatNode>;

    checklistSelection = new SelectionModel<DynamicColumnFlatNode>(true);

    getLevel = (node: DynamicColumnFlatNode) => node.level;

    isExpandable = (node: DynamicColumnFlatNode) => node.expandable;

    getChildren = (node: DynamicColumnNode): DynamicColumnNode[] => node.children;

    hasChild = (_: number, nodeData: DynamicColumnFlatNode) => nodeData.expandable;

    hasNoContent = (_: number, nodeData: DynamicColumnFlatNode) => nodeData.name === '';

    constructor(
        public dialogRef: MatDialogRef<PatientDetailGridSettingsComponent>,

        @Inject(MAT_DIALOG_DATA) public data: any,
    ) {
        this.treeFlattener = new MatTreeFlattener(
            this.transformer, this.getLevel, this.isExpandable, this.getChildren
        );
        this.treeControl = new FlatTreeControl<DynamicColumnFlatNode>(this.getLevel, this.isExpandable);
        this.dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);

        this.dataSource.data = this.setSchemaStructure(this.data.schemaDynamicFormConfig);
    }

    ngOnInit(): void {
        this.checkParentSelections();
    }

    transformer = (node: DynamicColumnNode, level: number) => {
        const existingNode = this.nestedNodeMap.get(node);
        const flatNode = existingNode && existingNode.name === node.name
            ? existingNode
            : new DynamicColumnFlatNode();
        flatNode.id = node.id;
        flatNode.name = node.name;
        flatNode.level = level;
        flatNode.disabled = node.disabled;
        flatNode.expandable = !!node.children;
        this.flatNodeMap.set(flatNode, node);
        this.nestedNodeMap.set(node, flatNode);

        if (this.data.visibleColumns.includes(flatNode.id)) {
            this.checklistSelection.toggle(flatNode);
        }

        return flatNode;
    }

    descendantsAllSelected(node: DynamicColumnFlatNode): boolean {
        const descendants = this.treeControl.getDescendants(node);

        return descendants.every(child =>
            this.checklistSelection.isSelected(child)
        );
    }

    descendantsPartiallySelected(node: DynamicColumnFlatNode): boolean {
        const descendants = this.treeControl.getDescendants(node);
        const result = descendants.some(child => this.checklistSelection.isSelected(child));
        return result && !this.descendantsAllSelected(node);
    }

    dynamicColumnSelectionToggle(node: DynamicColumnFlatNode): void {
        this.checklistSelection.toggle(node);
        const descendants = this.treeControl.getDescendants(node);
        this.checklistSelection.isSelected(node)
            ? this.checklistSelection.select(...descendants)
            : this.checklistSelection.deselect(...descendants);

        descendants.every(child =>
            this.checklistSelection.isSelected(child)
        );
        this.checkAllParentsSelection(node);
    }

    dynamicColumnLeafItemSelectionToggle(node: DynamicColumnFlatNode): void {
        this.checklistSelection.toggle(node);
        this.checkAllParentsSelection(node);
    }

    checkAllParentsSelection(node: DynamicColumnFlatNode): void {
        let parent: DynamicColumnFlatNode | null = this.getParentNode(node);
        while (parent) {
            this.checkRootNodeSelection(parent);
            parent = this.getParentNode(parent);
        }
    }

    checkRootNodeSelection(node: DynamicColumnFlatNode): void {
        const nodeSelected = this.checklistSelection.isSelected(node);
        const descendants = this.treeControl.getDescendants(node);
        const descAllSelected = descendants.every(child =>
            this.checklistSelection.isSelected(child)
        );
        if (nodeSelected && !descAllSelected) {
            this.checklistSelection.deselect(node);
        } else if (!nodeSelected && descAllSelected) {
            this.checklistSelection.select(node);
        }
    }

    getParentNode(node: DynamicColumnFlatNode): DynamicColumnFlatNode | null {
        const currentLevel = this.getLevel(node);
        if (currentLevel < 1) { return null; }

        const startIndex = this.treeControl.dataNodes.indexOf(node) - 1;

        for (let i = startIndex; i >= 0; i--) {
            const currentNode = this.treeControl.dataNodes[i];

            if (this.getLevel(currentNode) < currentLevel) {
                return currentNode;
            }
        }
        return null;
    }

    isDisabled(node: DynamicColumnFlatNode): boolean {
        return node.disabled || (this.getParentNode(node)?.disabled ?? false);
    }

    onCancel(): void {
        this.dialogRef.close();
    }

    onSubmit(): void {
        this.dialogRef.close(this.checklistSelection.selected.map(selectedItem => selectedItem.id).filter(selectedItem => selectedItem));
    }

    private setSchemaStructure(formConfig: SchemaFieldStructure[] | undefined): DynamicColumnNode[] {
        if (!formConfig || isEmpty(formConfig)) {
            return [];
        }

        const tempData: any[] = [];
        formConfig.forEach(formElement => {
            if (formElement.nodeType === 'attribute') {
                tempData.push({
                    id: formElement.schemaNodeId,
                    name: formElement.name
                });

                return;
            }

            tempData.push({
                name: formElement.name,
                disabled: formElement.nodeType === 'group_list',
                children: this.setSchemaStructure(formElement.fields),
            })
        });

        return tempData;
    }

    private checkParentSelections(): void {
        const reversedEntries = Array.from(this.nestedNodeMap.entries()).reverse();
        const reversedNodeMap = new Map<DynamicColumnNode, DynamicColumnFlatNode>(reversedEntries);

        reversedNodeMap.forEach(flatNode => {
            const parentNode = this.getParentNode(flatNode);

            if (parentNode && this.descendantsAllSelected(parentNode) && !this.checklistSelection.isSelected(parentNode)) {
                this.checklistSelection.select(parentNode);
            }
        });
    }
}
