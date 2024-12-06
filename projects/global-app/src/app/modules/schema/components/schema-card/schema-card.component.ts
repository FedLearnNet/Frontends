import {Component, Input} from '@angular/core';
import {SchemaDTO} from "@global-app/schema/dto/schema";
import {Schema} from "@shared-lib/models";

@Component({
  selector: 'app-schema-card',
  templateUrl: './schema-card.component.html',
  styleUrl: './schema-card.component.scss'
})
export class SchemaCardComponent {
  @Input() schema: Schema;

}
