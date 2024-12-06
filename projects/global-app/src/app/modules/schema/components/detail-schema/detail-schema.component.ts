import {AfterViewInit, Component, ElementRef, inject, Input, OnInit, ViewChild} from '@angular/core';
import cytoscape from 'cytoscape';
import tidyTree from 'cytoscape-tidytree';
import {
  _handleDragEnd,
  _handleDragStart,
  DEFAULT_LAYOUT_OPTIONS,
  edgeComparator
} from "@shared-lib/utils/cytoscape-tidytree";
import {SchemaService} from "@global-app/schema/services/schema.service";
import {SchemaDTO} from "@global-app/schema/dto/schema";
import {MatDialog} from "@angular/material/dialog";
import {DetailDatatypeComponent} from "@global-app/schema/components/detail-datatype/detail-datatype.component";
import {DataTypeDTO} from "@global-app/schema/dto/datatype";
import {DetailSchemaCardComponent} from "@global-app/schema/components/detail-schema-card/detail-schema-card.component";
import {SchemaDetailDialog} from "@global-app/schema/model/schema";
import {cloneDeep} from "lodash";
import {
  SchemaCreateRootDialogComponent
} from "@global-app/schema/components/schema-create-root-dialog/schema-create-root-dialog.component";

cytoscape.use(tidyTree);


@Component({
  selector: 'app-detail-schema',
  templateUrl: './detail-schema.component.html',
  styleUrl: './detail-schema.component.scss'
})
export class DetailSchemaComponent implements OnInit {
  readonly schemaService: SchemaService = inject(SchemaService);
  readonly dialog = inject(MatDialog);

  @Input() schemaId: string;
  @ViewChild('cy') cyContainer!: ElementRef;

  cy: any;
  contextMenuVisible = false;
  contextMenuPosition = {x: 0, y: 0};
  selectedNode: any;

  schema: SchemaDTO;

  ngOnInit(): void {
    this.schemaService.getSubStructure(this.schemaId).subscribe(schema => {
      this.schema = schema;
      const elements = this.buildElements(schema);
      this.initializeGraph(elements);
    });
  }

  buildElements(schema: SchemaDTO): cytoscape.ElementDefinition[] {
    const elements: cytoscape.ElementDefinition[] = [];

    function traverse(node: SchemaDTO, parentId?: string) {
      const nodeId = node.uniqueId || node.name;
      elements.push({
        data: {
          id: nodeId,
          label: node.name,
          description: node.desc,
          type: node.type,
          dataTypeId: node.dataTypeId,
          ontologyId: node.ontologyId,
        },
      });
      if (parentId) {
        elements.push({
          data: {
            source: parentId,
            target: nodeId,
          },
        });
      }
      if (node.children && node.children.length > 0) {
        node.children.forEach((child) => traverse(child, nodeId));
      }
    }

    traverse(schema);

    return elements;
  }

  initializeGraph(elements: cytoscape.ElementDefinition[] = []) {
    this.cy = cytoscape({
      container: this.cyContainer.nativeElement,
      maxZoom: 2,
      elements: elements,
      style: [
        {
          selector: 'node',
          style: {
            'background-color': function (ele: any) {
              return ele.data('type') === 'attribute' ? '#373636' : '#714a4a';
            },
            'label': 'data(label)',
            'text-valign': 'center',
            'text-halign': 'center',
            'shape': 'rectangle',
            'width': '150px',
            'height': '50px',
            'color': '#ffffff',
            'font-size': '12px',
            'text-wrap': 'wrap',
            'border-width': 2,
            'border-color': function (ele: any) {
              let valid: boolean = !!(ele.data('label') && ele.data('description') && ele.data('type'));
              if (valid && ele.data('type') === 'attribute') {
                valid = !!(ele.data('dataTypeId') && ele.data('ontologyId'));
              } else if (valid && ele.data('type') === 'group') {
                valid = true;
              }
              return !valid ? '#b10000' : '#000000';
            },
          }
        },
        {
          selector: 'edge',
          style: {
            "curve-style": "taxi",
            "taxi-direction": "downward",
            "taxi-turn": "20px",
            "target-arrow-shape": "triangle",
          }
        }
      ],
      layout: DEFAULT_LAYOUT_OPTIONS
    } as any);

    // Kontextmenü anzeigen, wenn auf einen Knoten geklickt wird
    this.cy.on('tap', 'node', (event: any) => {
      const node = event.target;
      this.selectedNode = node;

      const containerRect = this.cyContainer.nativeElement.getBoundingClientRect();
      this.contextMenuPosition.x = event.originalEvent.clientX - containerRect.left;
      this.contextMenuPosition.y = event.originalEvent.clientY - containerRect.top;

      this.contextMenuVisible = true;
    });

    // Kontextmenü schließen, wenn irgendwo anders geklickt wird
    this.cy.on('tap', (event: any) => {
      if (event.target === this.cy) {
        this.contextMenuVisible = false;
      }
    });
    this.cy.on("grabon", (event: any) => {
      _handleDragStart(event)
    });
    this.cy.on("dragfreeon", (event: any) => {
      _handleDragEnd(event, this.cy, DEFAULT_LAYOUT_OPTIONS)
    });

    const root = this.cy.getElementById(0);
    root.ungrabify();
  }

  findNodeById(id: string): SchemaDetailDialog | null {
    const root = this.schema;

    function traverse(node: SchemaDTO, parent: SchemaDTO | undefined): SchemaDetailDialog | null {
      if (node.uniqueId === id) {
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

    return traverse(this.schema, undefined);
  }

  replaceNodeById(id: string, newNode: SchemaDTO): boolean {
    function traverse(node: SchemaDTO): boolean {
      if (!node.children || node.children.length === 0) {
        return false;
      }

      for (let i = 0; i < node.children.length; i++) {
        if (node.children[i].uniqueId === id) {
          node.children[i] = newNode;
          return true;
        }
        const result = traverse(node.children[i]);
        if (result) {
          return true;
        }
      }

      return false;
    }

    return traverse(this.schema);
  }

  addNodeToParentById(parentId: string, newNode: SchemaDTO): boolean {
    function traverse(node: SchemaDTO): boolean {
      if (node.uniqueId === parentId) {
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

    return traverse(this.schema);
  }

  deleteNodeById(id: string): boolean {
    function traverse(node: SchemaDTO): boolean {
      if (!node.children || node.children.length === 0) {
        return false;
      }

      for (let i = 0; i < node.children.length; i++) {
        if (node.children[i].uniqueId === id) {
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

    return traverse(this.schema);
  }


  editSchema(): void {
    const id = this.selectedNode.id();
    const schemaGroup = this.findNodeById(id);
    const dialogRef = this.dialog.open(DetailSchemaCardComponent, {
      data: schemaGroup
    });

    dialogRef.afterClosed().subscribe((result?: SchemaDTO) => {
      if (result !== undefined) {
        this.replaceNodeById(id, result);
        const elements = this.buildElements(this.schema);
        this.initializeGraph(elements);
      }
    });
  }

  createRoot(): void {
    const dialogRef = this.dialog.open(SchemaCreateRootDialogComponent);

    dialogRef.afterClosed().subscribe((result?: SchemaDTO) => {
      if (result !== undefined) {
        this.schema = result;
        const elements = this.buildElements(this.schema);
        this.initializeGraph(elements);
      }
    });
  }

  addChildren(): void {
    const id = this.selectedNode.id();
    const schemaGroup = cloneDeep(this.findNodeById(id));
    if (!schemaGroup) {
      return;
    }
    schemaGroup.parent = schemaGroup.current;
    schemaGroup.current = {name: '', desc: '', type: '', children: []};

    const dialogRef = this.dialog.open(DetailSchemaCardComponent, {
      data: schemaGroup
    });

    dialogRef.afterClosed().subscribe((result?: SchemaDTO) => {
      if (result !== undefined) {
        this.addNodeToParentById(id, result);
        const elements = this.buildElements(this.schema);
        this.initializeGraph(elements);
      }
    });
  }

  deleteSchema(): void {
    const id = this.selectedNode.id();
    const elements = this.buildElements(this.schema);
    this.deleteNodeById(id);
    //TODO delete node from backend
    this.initializeGraph(elements);
  }


}
