import {Component, inject, Input, OnInit} from '@angular/core';
import {EMPTY, Observable} from "rxjs";
import {SchemaService} from "@global-app/schema/services/schema.service";
import {SchemaDTO} from "@global-app/schema/dto/schema";
import {Schema} from "@shared-lib/models";

@Component({
  selector: 'app-schema-card-list',
  templateUrl: './schema-card-list.component.html',
  styleUrl: './schema-card-list.component.scss'
})
export class SchemaCardListComponent implements OnInit {
  readonly schemaService: SchemaService = inject(SchemaService);

  @Input() ontologyId: string;

  schemas$: Observable<Schema[]> = EMPTY;

  ngOnInit(): void {
    this.schemas$ = this.schemaService.getAllSchemasHead(this.ontologyId);
  }


}
