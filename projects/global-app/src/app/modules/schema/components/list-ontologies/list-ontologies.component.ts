import {Component, inject, OnInit} from '@angular/core';
import {MatTableDataSource} from "@angular/material/table";
import {OntologyService} from "@global-app/schema/services/ontology.service";
import {OntologyDTO} from "../../dto/ontology";

@Component({
  selector: 'app-list-ontologies',
  templateUrl: './list-ontologies.component.html',
  styleUrl: './list-ontologies.component.scss'
})
export class ListOntologiesComponent implements OnInit {
  readonly ontologyService: OntologyService = inject(OntologyService);

  displayedColumns: string[] = ['id', 'name', 'desc'];
  dataSource = new MatTableDataSource<OntologyDTO>();


  ngOnInit() {
    this.ontologyService.getAll().subscribe(ontologies => {
      this.dataSource = new MatTableDataSource(ontologies);
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }
}
