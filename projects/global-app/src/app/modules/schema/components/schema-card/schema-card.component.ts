import {Component, input, ChangeDetectionStrategy} from '@angular/core';
import {RouterLink} from '@angular/router';
import {MatCard, MatCardContent, MatCardHeader, MatCardTitle} from '@angular/material/card';
import {SchemaNodeDetailDTO} from "@global-app/schema/dto/schema";

@Component({
  selector: 'app-schema-card',
  templateUrl: './schema-card.component.html',
  styleUrl: './schema-card.component.scss',
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [RouterLink, MatCard, MatCardHeader, MatCardTitle, MatCardContent]
})
export class SchemaCardComponent {
  schema = input.required<SchemaNodeDetailDTO>()
}
