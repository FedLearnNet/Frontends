import {Component, Inject, inject, Input, OnInit} from '@angular/core';
import {OntologyService} from "@global-app/schema/services/ontology.service";
import {OntologyDTO} from "../../dto/ontology";
import {MatTableDataSource} from "@angular/material/table";
import {Observable} from "rxjs";

@Component({
  selector: 'app-detail-ontology',
  templateUrl: './detail-ontology.component.html',
  styleUrl: './detail-ontology.component.scss'
})
export class DetailOntologyComponent implements OnInit {
  @Input() ontologyId: string;

  readonly ontologyService: OntologyService = inject(OntologyService);

  foundOntology?: OntologyDTO;
  ontologies: OntologyDTO[] = [];

  ngOnInit(): void {
    this.ontologyService.getAll().subscribe(ontologies => {
      this.ontologies = ontologies;
      if (this.ontologyId === 'new') {
        this.foundOntology = {parentIds: [], name: '', desc: '', childrenIds: []};
        return;
      }
      this.foundOntology = this.ontologies.find(ontology => ontology.uniqueId === this.ontologyId);
    });
  }

  saveOntology() {
    if (this.foundOntology) {
      this.ontologyService.put(this.foundOntology).subscribe((update) => {
        this.foundOntology = update;
      });
    }
  }


}
