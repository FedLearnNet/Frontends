import {Component, inject, OnInit} from '@angular/core';
import {MatTableDataSource} from "@angular/material/table";
import {SchemaService} from "@global-app/schema/services/schema.service";
import {SchemaDTO} from "@global-app/schema/dto/schema";
import {Schema} from "@shared-lib/models";

@Component({
  selector: 'app-list-schema',
  templateUrl: './list-schema.component.html',
  styleUrl: './list-schema.component.scss'
})
export class ListSchemaComponent implements OnInit {
  readonly schemaService: SchemaService = inject(SchemaService);

  displayedColumns: string[] = ['id', 'name', 'desc'];
  dataSource = new MatTableDataSource<Schema>();


  ngOnInit() {
    this.schemaService.getAllSchemasHead().subscribe(schemas => {
      this.dataSource = new MatTableDataSource(schemas);
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }
}
