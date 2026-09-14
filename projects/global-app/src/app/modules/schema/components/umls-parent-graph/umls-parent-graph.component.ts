import {AfterViewInit, Component, ElementRef, inject, ViewChild} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {UMLSSearchResultDTO} from "../../dto/umls";
import cytoscape from 'cytoscape';
import {UMLSService} from "@global-app/schema/services/umls";
import {MatProgressSpinnerModule} from "@angular/material/progress-spinner";
import {filter} from "rxjs/operators";
import {_handleDragEnd, _handleDragStart, DEFAULT_LAYOUT_OPTIONS} from "@shared-lib/utils/cytoscape-tidytree";
import {TranslatePipe} from "@ngx-translate/core";

@Component({
  selector: 'app-umls-parent-graph',
  imports: [MatFormFieldModule,
    MatInputModule,
    FormsModule,
    MatButtonModule,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatProgressSpinnerModule,
    TranslatePipe
  ],
  templateUrl: './umls-parent-graph.component.html',
  styleUrl: './umls-parent-graph.component.scss'
})
export class UmlsParentGraphComponent implements AfterViewInit {
  readonly dialogRef = inject(MatDialogRef<UmlsParentGraphComponent>);
  readonly data = inject<UMLSSearchResultDTO>(MAT_DIALOG_DATA);
  readonly uMLSService: UMLSService = inject(UMLSService)

  private elements: cytoscape.ElementDefinition[] = [];
  @ViewChild('cy') cyContainer!: ElementRef;

  loading = true;
  canImport = false;
  cy: any;

  ngAfterViewInit() {
    this.uMLSService.getUmlsParentGraph(this.data.ui).subscribe(elements => {
      this.loading = false;
      this.elements = elements.map((e: any) => {
        const isEdge = e.source != null && e.target != null;

        if (isEdge) {
          return {
            group: 'edges',
            data: {
              id: e.id,
              source: e.source,
              target: e.target,
              inDB: e.inDB,
            }
          };
        }
        return {
          group: 'nodes',
          data: {
            id: e.id,
            name: e.name,
            inDB: e.inDB,
          }
        };
      });
      if (this.elements.filter(e => !(e?.data as any)?.inDB).length > 0) {
        this.canImport = true;
      }
      this.initializeGraph(this.elements);
    });
  }

  initializeGraph(elements: cytoscape.ElementDefinition[] = []) {
    const loadedName = this.data.name
    this.cy = cytoscape({
      container: this.cyContainer.nativeElement, // Container für den Graphen
      elements: elements,
      maxZoom: 2,
      style: [
        {
          selector: 'node',
          style: {
            'background-color': function (ele) {
              if (ele.data('inDB')) {
                return '#11f011';
              }
              return '#f01111';
            },
          },
        },
        {
          selector: 'node[name]',
          style: {
            label: 'data(name)',
            'border-width': function (ele: any) {
              const valid: boolean = ele.data('name') === loadedName;
              return valid ? 4 : 1;
            },
            'border-color': function (ele: any) {
              const valid: boolean = ele.data('name') === loadedName;
              return valid ? '#610000' : '#000000';
            },
          },
        },
        {
          selector: 'edge',
          style: {
            width: 3,
            'line-color': '#ccc',
            'target-arrow-color': '#ccc',
            'target-arrow-shape': 'triangle',
          },
        },
      ],

      layout: DEFAULT_LAYOUT_OPTIONS
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

  onNoClick(): void {
    this.dialogRef.close();
  }

  saveGraph(): void {
    this.uMLSService.createAllParents(this.data.ui).pipe(
      filter(response => !!response)
    ).subscribe(() => {

      this.elements.forEach(element => {
        (element.data as any).inDB = true;
      });
      this.initializeGraph(this.elements);
      this.canImport = false;
    });
  }

}
