import {Component, inject, input, OnInit, output, signal} from '@angular/core';
import {OntologyDTO, OntologyEdgeDTO, OntologyNodeDTO} from "../../dto/ontology";
import {map, Observable} from "rxjs";
import {FormControl, FormsModule, ReactiveFormsModule} from "@angular/forms";
import {startWith} from "rxjs/operators";
import {MatList, MatListSubheaderCssMatStyler} from '@angular/material/list';
import {MatIconButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {MatFormField, MatLabel, MatSuffix} from '@angular/material/form-field';
import {MatInput} from '@angular/material/input';
import {MatAutocomplete, MatAutocompleteTrigger} from '@angular/material/autocomplete';
import {MatOption} from '@angular/material/select';
import {AsyncPipe} from '@angular/common';
import {TranslatePipe} from '@ngx-translate/core';
import {OntologyService} from "@global-app/schema/services/ontology.service";
import {OntologyEdgeCardComponent} from "@global-app/schema/components/ontology-edge-card/ontology-edge-card.component";

@Component({
  selector: 'app-detail-ontology-relation-lists',
  templateUrl: './detail-ontology-relation-lists.component.html',
  styleUrl: './detail-ontology-relation-lists.component.scss',
  imports: [MatList, MatListSubheaderCssMatStyler, MatIconButton, MatIcon, ReactiveFormsModule, FormsModule, MatFormField, MatLabel, MatInput, MatAutocompleteTrigger, MatSuffix, MatAutocomplete, MatOption, AsyncPipe, TranslatePipe, OntologyEdgeCardComponent]
})
export class DetailOntologyRelationListsComponent implements OnInit {
  readonly ontologyService: OntologyService = inject(OntologyService);

  ontologyNode = input.required<OntologyNodeDTO>()

  readonly headerName = input<string>('');
  readonly placeholder = input<string>('');

  readonly relationIdsChange = output<string[]>();

  autoCompleteControl = new FormControl('');

  filteredOntologies: Observable<OntologyNodeDTO[]>;

  ontology = signal<OntologyDTO | undefined>(undefined);

  ngOnInit(): void {
    if (this.ontologyNode().id) {
      this.ontologyService.getAllNeighborsById(this.ontologyNode().id!).subscribe(ontology => {
        this.ontology.set(ontology);
      });
    }
    this.filteredOntologies = this.autoCompleteControl.valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value || '')),
    );
  }


  getRelatedOntology(edge: OntologyEdgeDTO) {
    const ontology = this.ontology()!;
    const node = this.ontologyNode();
    const otherId = edge.sourceId === node.id ? edge.targetId : edge.sourceId;
    return ontology.nodes.find(o => o.id === otherId);
  }

  getNameForId(_id: string): string {
    return "TODO"
    //return this.ontologies().find(ontology => ontology.id === id)?.names?.join(",") || '';
  }

  addRelation() {
    if (this.autoCompleteControl.value) {
      //this.relationIds.push(this.autoCompleteControl.value!);
      this.autoCompleteControl.setValue('');
    }
  }

  removeRelation(id: string) {
    this.ontology.update(o => {
      if (!o) return o;
      return {
        ...o,
        edges: o.edges?.filter(e => e.id !== id) || []
      };
    });

  }

  private _filter(value: string): OntologyNodeDTO[] {
    const _filterValue = value.toLowerCase();

    return [];
    /*return this.ontologies()
       .filter(ontology => ontology.names?.join(",").toLowerCase().includes(filterValue) ||
         ontology.id!.toLowerCase().includes(filterValue));*/
  }


}
