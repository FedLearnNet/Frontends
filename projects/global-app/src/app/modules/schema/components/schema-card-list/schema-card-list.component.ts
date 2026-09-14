import {Component, inject, input, OnInit} from '@angular/core';
import {EMPTY, Observable} from "rxjs";
import {SchemaService} from "@global-app/schema/services/schema.service";
import {SchemaCardComponent} from '../schema-card/schema-card.component';
import {AsyncPipe} from '@angular/common';
import {SchemaNodeDetailDTO} from "@global-app/schema/dto/schema";

@Component({
  selector: 'app-schema-card-list',
  templateUrl: './schema-card-list.component.html',
  styleUrl: './schema-card-list.component.scss',
  imports: [SchemaCardComponent, AsyncPipe]
})
export class SchemaCardListComponent implements OnInit {
  readonly schemaService: SchemaService = inject(SchemaService);

  readonly ontologyId = input<string>();

  schemas$: Observable<SchemaNodeDetailDTO[]> = EMPTY;

  ngOnInit(): void {
    this.schemas$ = this.schemaService.getAllSchemasHead(this.ontologyId());
  }


}
