import {Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {OntologyDTO} from "../../dto/ontology";
import {map, Observable} from "rxjs";
import {FormControl} from "@angular/forms";
import {startWith} from "rxjs/operators";

@Component({
  selector: 'app-detail-ontology-relation-lists',
  templateUrl: './detail-ontology-relation-lists.component.html',
  styleUrl: './detail-ontology-relation-lists.component.scss'
})
export class DetailOntologyRelationListsComponent implements OnInit {
  @Input() relationIds: string[] = [];
  @Input() headerName: string = '';
  @Input() placeholder: string = '';
  @Input() ontologies: OntologyDTO[] = [];

  @Output() relationIdsChange: EventEmitter<string[]> = new EventEmitter<string[]>();

  autoCompleteControl = new FormControl('');

  filteredOntologies: Observable<OntologyDTO[]>;


  ngOnInit(): void {
    this.filteredOntologies = this.autoCompleteControl.valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value || '')),
    );
  }


  getNameForId(id: string): string {
    return this.ontologies.find(ontology => ontology.uniqueId === id)?.name || '';
  }

  addRelation() {
    if (this.autoCompleteControl.value) {
      this.relationIds.push(this.autoCompleteControl.value!);
      this.autoCompleteControl.setValue('');
      this.publishChanges();
    }
  }

  removeRelation(id: string) {
    this.relationIds = this.relationIds.filter(relationId => relationId !== id);
    this.publishChanges();
  }

  publishChanges() {
    this.relationIdsChange.emit(this.relationIds);
  }

  private _filter(value: string): OntologyDTO[] {
    const filterValue = value.toLowerCase();

    return this.ontologies
      .filter(ontology => ontology.name.toLowerCase().includes(filterValue) ||
        ontology.uniqueId!.toLowerCase().includes(filterValue));
  }


}
